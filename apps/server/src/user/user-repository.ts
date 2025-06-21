import {
  Code,
  Exception,
  IObjectStoragePort,
  IUserRepository,
  Nullable,
  TEditableUser,
  TUser,
  UserId,
} from '@repo/be-core';
import { DataSource, IsNull, Repository } from 'typeorm';
import { TypeormUser } from '../infrastructure/persistence/typeorm/entity/user/typeorm-user.entity';
import { UserMapper } from './mapper/user-mapper';
import { Inject, Logger, LoggerService, Optional } from '@nestjs/common';
import { DiTokens } from '../di/di-tokens';
import { ServerConfig } from '../config/server-config';

const generateObjectStorageKey = (userId: string): string => {
  return `profile-image/${userId}`;
};

// TODO : 전체 Repository Promise 최적화 필요
export class TypeormUserRepository implements IUserRepository {
  private readonly bucketName: string;

  private typeormUserRepository: Repository<TypeormUser>;
  private readonly logger: LoggerService;

  constructor(
    dataSource: DataSource,
    @Inject(DiTokens.ObjectStorage)
    private readonly objectStorage: IObjectStoragePort,
    @Optional() logger?: LoggerService
  ) {
    this.typeormUserRepository = dataSource.getRepository(TypeormUser);
    this.bucketName = ServerConfig.OBJECT_STORAGE_MEDIA_BUCKET;

    this.logger = logger || new Logger(TypeormUserRepository.name);
  }

  async findUserById(id: UserId): Promise<Nullable<TUser>> {
    const ormUser = await this.typeormUserRepository
      .createQueryBuilder('user')
      .where('user.id = :id', { id })
      .andWhere('user.deletedDateTime is null')
      .getOne();
    if (!ormUser) {
      return null;
    }

    const resolved = await this.resolveSignedUrl(ormUser);

    const user = UserMapper.toDomainEntity(resolved);

    return user;
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
}
