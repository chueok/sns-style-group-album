import { IUserRepository, Nullable, User, UserId } from "@repo/be-core";
import { DataSource, Repository } from "typeorm";
import { TypeormUser } from "../../entity/user/typeorm-user.entity";
import { UserMapper } from "./mapper/user-mapper";
import { Logger, LoggerService, Optional } from "@nestjs/common";

export class TypeormUserRepository implements IUserRepository {
  private typeormUserRepository: Repository<TypeormUser>;
  private readonly logger: LoggerService;

  constructor(dataSource: DataSource, @Optional() logger?: LoggerService) {
    this.typeormUserRepository = dataSource.getRepository(TypeormUser);

    this.logger = logger || new Logger(TypeormUserRepository.name);
  }

  async createUser(user: User): Promise<boolean> {
    const ormEntity = UserMapper.toOrmEntity([user]);

    return this.typeormUserRepository
      .save(ormEntity)
      .then(() => {
        return true;
      })
      .catch(() => {
        return false;
      });
  }

  async updateUser(user: User): Promise<boolean> {
    const ormEntity = UserMapper.toOrmEntity([user])[0];
    if (!ormEntity) return false;

    return this.typeormUserRepository
      .update(user.id, ormEntity)
      .then(() => true)
      .catch(() => false);
  }

  async findUserById(id: UserId): Promise<Nullable<User>> {
    const ormUser = await this.typeormUserRepository.findOneBy({ id });
    if (!ormUser) {
      return null;
    }
    const { results, errors } = await UserMapper.toDomainEntity([ormUser]);
    errors.forEach((error) => {
      this.logger.error(error);
    });
    return results[0] || null;
  }

  async findUserByUsernameOfGroup(payload: {
    username: string;
    groupId: string;
  }): Promise<Nullable<User>> {
    const ormUser = await this.typeormUserRepository
      .createQueryBuilder("user")
      .innerJoinAndSelect("user.groups", "group")
      .where("group.id = :groupId", { groupId: payload.groupId })
      .andWhere("user.username = :username", { username: payload.username })
      .getOne();
    if (!ormUser) {
      return null;
    }
    const { results, errors } = await UserMapper.toDomainEntity([ormUser]);
    errors.forEach((error) => {
      this.logger.error(error);
    });
    return results[0] || null;
  }

  async findUserListByGroupId(groupId: string): Promise<User[]> {
    const ormUsers = await this.typeormUserRepository
      .createQueryBuilder("user")
      .innerJoinAndSelect("user.groups", "group")
      .where("group.id = :groupId", { groupId })
      .getMany();

    const { results, errors } = await UserMapper.toDomainEntity(ormUsers);
    errors.forEach((error) => {
      this.logger.error(error);
    });

    return results;
  }
}
