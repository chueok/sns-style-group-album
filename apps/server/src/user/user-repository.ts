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

  async updateUser(
    userId: string,
    updateObj: Partial<TEditableUser>
  ): Promise<void> {
    if (Object.keys(updateObj).length === 0) {
      throw Exception.new({
        code: Code.BAD_REQUEST_ERROR,
        overrideMessage: 'No changes to update',
      });
    }

    const obj = {
      ...updateObj,
      updatedDateTime: new Date(),
    };

    const updateResult = await this.typeormUserRepository
      .createQueryBuilder()
      .update()
      .where('id = :id', { id: userId })
      .andWhere('deletedDateTime is null')
      .set(obj)
      .execute();

    if (updateResult.affected === 0) {
      throw Exception.new({
        code: Code.INTERNAL_ERROR,
        overrideMessage: 'Failed to update user',
      });
    }
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
