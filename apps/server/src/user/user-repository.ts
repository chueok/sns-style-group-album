import {
  Code,
  Exception,
  IUserRepository,
  Nullable,
  TEditableUser,
  TUser,
  UserId,
} from '@repo/be-core';
import { DataSource, Repository, SelectQueryBuilder } from 'typeorm';
import {
  isTypeormUserWith,
  TypeormUser,
} from '../infrastructure/persistence/typeorm/entity/user/typeorm-user.entity';
import { UserMapper } from './mapper/user-mapper';
import { Logger, LoggerService, Optional } from '@nestjs/common';
import { TypeormUserGroupProfile } from '../infrastructure/persistence/typeorm/entity/user-group-profile/typeorm-user-group-profile.entity';
import { isTypeormGroupWith } from '../infrastructure/persistence/typeorm/entity/group/typeorm-group.entity';

// TODO : 전체 Repository Promise 최적화 필요
export class TypeormUserRepository implements IUserRepository {
  private readonly userQueryAlias = 'user';

  private typeormUserRepository: Repository<TypeormUser>;
  private typeormUserGroupProfileRepository: Repository<TypeormUserGroupProfile>;
  private readonly logger: LoggerService;

  constructor(dataSource: DataSource, @Optional() logger?: LoggerService) {
    this.typeormUserRepository = dataSource.getRepository(TypeormUser);
    this.typeormUserGroupProfileRepository = dataSource.getRepository(
      TypeormUserGroupProfile
    );

    this.logger = logger || new Logger(TypeormUserRepository.name);
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

    const groups = ormUser.__groups__;
    const ownGroups = ormUser.__ownGroups__;
    const userGroupProfile = ormUser.__userGroupProfiles__;
    const invitedGroups = ormUser.__invitedGroups__;

    const invitedGroupsElements = invitedGroups
      .map((invitedGroup) => {
        if (
          !isTypeormGroupWith(invitedGroup, 'memberProfiles') ||
          !isTypeormGroupWith(invitedGroup, 'owner')
        ) {
          return null;
        }
        const memberProfiles = invitedGroup.__memberProfiles__;
        const owner = invitedGroup.__owner__;

        return { group: invitedGroup, memberProfiles, owner };
      })
      .filter((element) => element !== null);

    const user = UserMapper.toDomainEntity(ormUser);

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

    const elements = await Promise.all(
      ormUsers.map(async (ormUser) => {
        const invitedGroups = await ormUser.invitedGroups;
        const invitedGroupsElements = await Promise.all(
          invitedGroups.map(async (invitedGroup) => {
            const memberProfiles = await invitedGroup.memberProfiles;
            const owner = await invitedGroup.owner;
            return { group: invitedGroup, memberProfiles, owner };
          })
        );
        return {
          user: ormUser,
          groups: await ormUser.groups,
          ownGroups: await ormUser.ownGroups,
          userGroupProfiles: await ormUser.userGroupProfiles,
          invitedGroupsElements,
        };
      })
    );

    const users = UserMapper.toDomainEntityList(ormUsers);

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

  private extendQueryWithNotDeleted(
    queryBuilder: SelectQueryBuilder<TypeormUser>
  ): SelectQueryBuilder<TypeormUser> {
    return queryBuilder.andWhere(
      `${this.userQueryAlias}.deletedDateTime is null`
    );
  }
}
