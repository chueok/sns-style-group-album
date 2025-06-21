import {
  Code,
  Exception,
  IUserRepository,
  Nullable,
  TEditableUser,
  TUser,
  UserId,
} from '@repo/be-core';
import { DataSource, Repository } from 'typeorm';
import { TypeormUser } from '../infrastructure/persistence/typeorm/entity/user/typeorm-user.entity';
import { UserMapper } from './mapper/user-mapper';
import { Logger, LoggerService, Optional } from '@nestjs/common';

export class TypeormUserRepository implements IUserRepository {
  private typeormUserRepository: Repository<TypeormUser>;
  private readonly logger: LoggerService;

  constructor(dataSource: DataSource, @Optional() logger?: LoggerService) {
    this.typeormUserRepository = dataSource.getRepository(TypeormUser);

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

    const user = UserMapper.toDomainEntity(ormUser);

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
