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
    const ormUser = await this.typeormUserRepository
      .createQueryBuilder("user")
      .leftJoinAndSelect("user.groups", "group")
      .leftJoinAndSelect("user.ownGroups", "ownGroup")
      .where("user.id = :id", { id })
      .andWhere("user.deletedDateTime is null")
      .getOne();

    if (!ormUser) {
      return null;
    }
    const groups = await ormUser.groups;
    const ownGroups = await ormUser.ownGroups;
    const { results, errors } = await UserMapper.toDomainEntity({
      elements: [{ user: ormUser, groups, ownGroups }],
    });
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
      .leftJoinAndSelect("user.ownGroups", "ownGroup")
      .where("group.id = :groupId", { groupId: payload.groupId })
      .andWhere("user.username = :username", { username: payload.username })
      .andWhere("user.deletedDateTime is null")
      .getOne();
    if (!ormUser) {
      return null;
    }
    const groups = await ormUser.groups;
    const ownGroups = await ormUser.ownGroups;
    const { results, errors } = await UserMapper.toDomainEntity({
      elements: [{ user: ormUser, groups, ownGroups }],
    });
    errors.forEach((error) => {
      this.logger.error(error);
    });
    return results[0] || null;
  }

  async findUserListByGroupId(groupId: string): Promise<User[]> {
    const ormUsers = await this.typeormUserRepository
      .createQueryBuilder("user")
      .innerJoinAndSelect("user.groups", "group")
      .leftJoinAndSelect("user.ownGroups", "ownGroup")
      .where("group.id = :groupId", { groupId })
      .andWhere("user.deletedDateTime is null")
      .getMany();

    const elements = await Promise.all(
      ormUsers.map(async (ormUser) => {
        return {
          user: ormUser,
          groups: await ormUser.groups,
          ownGroups: await ormUser.ownGroups,
        };
      }),
    );

    const { results, errors } = await UserMapper.toDomainEntity({ elements });
    errors.forEach((error) => {
      this.logger.error(error);
    });

    return results;
  }

  async findUserByOauth(payload: {
    provider: string;
    providerId: string;
  }): Promise<Nullable<User>> {
    const ormUser = await this.typeormUserRepository
      .createQueryBuilder("user")
      .innerJoinAndSelect("user.oauths", "oauth")
      .leftJoinAndSelect("user.groups", "group")
      .leftJoinAndSelect("user.ownGroups", "ownGroup")
      .where("oauth.provider = :provider", { provider: payload.provider })
      .andWhere("oauth.providerId = :providerId", {
        providerId: payload.providerId,
      })
      .andWhere("user.deletedDateTime is null")
      .getOne();

    if (!ormUser) {
      return null;
    }

    const groups = await ormUser.groups;
    const ownGroups = await ormUser.ownGroups;

    const { results, errors } = await UserMapper.toDomainEntity({
      elements: [{ user: ormUser, groups, ownGroups }],
    });
    errors.forEach((error) => {
      this.logger.error(error);
    });

    return results[0] || null;
  }
}
