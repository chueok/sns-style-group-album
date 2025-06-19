import {
  Code,
  Exception,
  IObjectStoragePort,
  IUserRepository,
  Nullable,
  TEditableUser,
  TMemberPaginatedResult,
  TMemberPaginationParams,
  TMemberProfile,
  TUser,
  UserId,
} from '@repo/be-core';
import { DataSource, IsNull, Repository } from 'typeorm';
import {
  isTypeormUserWith,
  TypeormUser,
} from '../infrastructure/persistence/typeorm/entity/user/typeorm-user.entity';
import { UserMapper } from './mapper/user-mapper';
import { Inject, Logger, LoggerService, Optional } from '@nestjs/common';
import { TypeormUserGroupProfile } from '../infrastructure/persistence/typeorm/entity/user-group-profile/typeorm-user-group-profile.entity';
import { DiTokens } from '../di/di-tokens';
import { ServerConfig } from '../config/server-config';

const generateObjectStorageKey = (userId: string): string => {
  return `profile-image/${userId}`;
};

// TODO : 전체 Repository Promise 최적화 필요
export class TypeormUserRepository implements IUserRepository {
  private readonly userQueryAlias = 'user';
  private readonly bucketName: string;

  private typeormUserRepository: Repository<TypeormUser>;
  private typeormUserGroupProfileRepository: Repository<TypeormUserGroupProfile>;
  private readonly logger: LoggerService;

  constructor(
    dataSource: DataSource,
    @Inject(DiTokens.ObjectStorage)
    private readonly objectStorage: IObjectStoragePort,
    @Optional() logger?: LoggerService
  ) {
    this.typeormUserRepository = dataSource.getRepository(TypeormUser);
    this.typeormUserGroupProfileRepository = dataSource.getRepository(
      TypeormUserGroupProfile
    );

    this.bucketName = ServerConfig.OBJECT_STORAGE_MEDIA_BUCKET;

    this.logger = logger || new Logger(TypeormUserRepository.name);
  }

  async deleteProfileImage(userId: string): Promise<void> {
    const user = await this.typeormUserRepository.findOne({
      where: {
        id: userId as UserId,
        deletedDateTime: IsNull(),
      },
    });

    if (!user) {
      throw Exception.new({
        code: Code.ENTITY_NOT_FOUND_ERROR,
        overrideMessage: 'User not found',
      });
    }

    if (user.profileImageUrl) {
      await this.objectStorage.deleteObject(
        this.bucketName,
        user.profileImageUrl
      );
      await this.typeormUserRepository.update(userId, {
        profileImageUrl: null,
      });
    }
  }

  private async resolveSignedUrl(entity: TypeormUser): Promise<TypeormUser> {
    if (entity.profileImageUrl) {
      entity.profileImageUrl =
        await this.objectStorage.getPresignedUrlForDownload(
          this.bucketName,
          entity.profileImageUrl
        );
    }
    return entity;
  }

  // TODO: 실패할 경우 profileImageUrl 을 undefined로 초기화 할 것
  private async resolveSignedUrlList(
    entityList: TypeormUser[]
  ): Promise<TypeormUser[]> {
    const result = await Promise.allSettled(
      entityList.map((entity) => this.resolveSignedUrl(entity))
    );

    result.map((result) => {
      if (result.status === 'rejected') {
        console.error({ result: result.reason });
      }
    });

    return result
      .map((result) => (result.status === 'fulfilled' ? result.value : null))
      .filter((result) => result !== null);
  }

  async createProfileImageUploadUrl(userId: string): Promise<string> {
    const key = generateObjectStorageKey(userId);
    const url = await this.objectStorage.getPresignedUrlForUpload(
      this.bucketName,
      key,
      3 * 60 // 3분
    );
    await this.typeormUserRepository.update(userId, {
      profileImageUrl: key,
    });

    return url;
  }

  async findMemberProfiles(payload: {
    groupId: string;
    userIds: string[];
  }): Promise<TMemberProfile[]> {
    const { groupId, userIds } = payload;

    const result = await this.typeormUserRepository
      .createQueryBuilder('user')
      .where('user.id IN (:...userIds)', { userIds })
      .andWhere('user.deletedDateTime is null')
      .leftJoin('user.groups', 'groups')
      .andWhere('groups.id = :groupId', { groupId })
      .getMany();

    const resolved = await this.resolveSignedUrlList(result);

    return resolved.map((resolvedUser) => ({
      id: resolvedUser.id,
      username: resolvedUser.username || '',
      profileImageUrl: resolvedUser.profileImageUrl || null,
    }));
  }

  async findMemberProfilesByPagination(payload: {
    groupId: string;
    pagination: TMemberPaginationParams;
  }): Promise<TMemberPaginatedResult<TMemberProfile>> {
    const page = payload.pagination.page ?? 1;

    const queryBuilder = this.typeormUserRepository
      .createQueryBuilder('user')
      .leftJoin('user.groups', 'groups')
      .where('groups.id = :groupId', { groupId: payload.groupId })
      .andWhere('user.deletedDateTime is null')
      .orderBy('user.username', 'ASC');

    const total = await queryBuilder.getCount();

    queryBuilder
      .skip((page - 1) * payload.pagination.pageSize)
      .take(payload.pagination.pageSize);

    const ormUsers = await queryBuilder.getMany();

    const resolved = await this.resolveSignedUrlList(ormUsers);

    return {
      items: resolved.map((resolvedUser) => ({
        id: resolvedUser.id,
        username: resolvedUser.username || '',
        profileImageUrl: resolvedUser.profileImageUrl || null,
      })),
      total,
      page,
      pageSize: payload.pagination.pageSize,
      totalPages: Math.ceil(total / payload.pagination.pageSize),
    };
  }

  async isUserInGroup(userId: string, groupId: string): Promise<boolean> {
    const result = await this.typeormUserRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.groups', 'groups')
      .where('user.id = :id', { id: userId })
      .andWhere('groups.id = :groupId', { groupId })
      .andWhere('user.deletedDateTime is null')
      .getOne();

    return result !== null;
  }

  async updateUser(userId: string, user: TEditableUser): Promise<boolean> {
    const result = await this.typeormUserRepository.update(userId, {
      ...user,
      updatedDateTime: new Date(),
    });

    if (result.affected === 0) {
      return false;
    }

    return true;
  }

  async findUserById(id: UserId): Promise<Nullable<TUser>> {
    const ormUser = await this.typeormUserRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.groups', 'groups')
      .leftJoinAndSelect('user.ownGroups', 'ownGroup')
      .leftJoinAndSelect('user.userGroupProfiles', 'userGroupProfiles')
      .leftJoinAndSelect('user.invitedGroups', 'invitedGroups')
      .leftJoinAndSelect('invitedGroups.memberProfiles', 'memberProfiles')
      .leftJoinAndSelect('invitedGroups.owner', 'owner')
      .where('user.id = :id', { id })
      .andWhere('user.deletedDateTime is null')
      .getOne();
    if (!ormUser) {
      return null;
    }

    if (
      !isTypeormUserWith(ormUser, 'groups') ||
      !isTypeormUserWith(ormUser, 'ownGroups') ||
      !isTypeormUserWith(ormUser, 'userGroupProfiles') ||
      !isTypeormUserWith(ormUser, 'invitedGroups')
    ) {
      return null;
    }

    const resolved = await this.resolveSignedUrl(ormUser);

    const user = UserMapper.toDomainEntity(resolved);

    return user;
  }

  async findUsersByGroupId(groupId: string): Promise<TUser[]> {
    const ormUsers = await this.typeormUserRepository
      .createQueryBuilder('user')
      .innerJoinAndSelect('user.groups', 'groups')
      .leftJoinAndSelect('user.ownGroups', 'ownGroup')
      .leftJoinAndSelect('user.userGroupProfiles', 'userGroupProfiles')
      .leftJoinAndSelect('user.invitedGroups', 'invitedGroups')
      .leftJoinAndSelect('invitedGroups.memberProfiles', 'memberProfiles')
      .leftJoinAndSelect('invitedGroups.owner', 'owner')
      .where('groups.id = :groupId', { groupId })
      .andWhere('user.deletedDateTime is null')
      .getMany();

    const resolved = await this.resolveSignedUrlList(ormUsers);

    const users = UserMapper.toDomainEntityList(resolved);

    return users;
  }

  async updateGroupProfile(payload: {
    userId: string;
    groupId: string;
    username?: string;
    profileImageUrl?: string;
  }): Promise<TUser> {
    const { userId, groupId, username, profileImageUrl } = payload;

    // 없을 경우 생성
    // 있을 경우 업데이트

    const hasGroupProfile = await this.hasGroupProfile(userId, groupId);
    if (!hasGroupProfile) {
      await this.typeormUserGroupProfileRepository.save({
        userId,
        groupId,
        username,
        profileImageUrl,
      });
    } else {
      await this.typeormUserGroupProfileRepository.update(userId, {
        username,
        profileImageUrl,
      });
    }

    const user = await this.findUserById(userId as UserId);
    if (!user) {
      throw Exception.new({
        code: Code.ENTITY_NOT_FOUND_ERROR,
        overrideMessage: 'User not found',
      });
    }

    return user;
  }

  async deleteUser(userId: string): Promise<void> {
    const result = await this.typeormUserRepository.update(userId, {
      deletedDateTime: new Date(),
    });

    if (result.affected === 0) {
      throw Exception.new({
        code: Code.ENTITY_NOT_FOUND_ERROR,
        overrideMessage: 'User not found',
      });
    }
  }

  private async hasGroupProfile(
    userId: string,
    groupId: string
  ): Promise<boolean> {
    const result = await this.typeormUserGroupProfileRepository
      .createQueryBuilder('groupProfile')
      .where('groupProfile.userId = :userId', { userId })
      .andWhere('groupProfile.userId = :groupId', { groupId })
      .andWhere('groupProfile.deletedDateTime is null')
      .getOne();

    return result !== null;
  }
}
