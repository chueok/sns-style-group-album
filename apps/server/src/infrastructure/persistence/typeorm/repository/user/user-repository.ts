import { IUserRepository, Nullable, User, UserId } from "@repo/be-core";
import { DataSource, Repository } from "typeorm";
import { TypeormUser } from "../../entity/user/typeorm-user.entity";
import { UserMapper } from "./mapper/user-mapper";
import { Logger, LoggerService, Optional } from "@nestjs/common";
import { TypeormUserGroupProfile } from "../../entity/user-group-profile/typeorm-user-group-profile.entity";

export class TypeormUserRepository implements IUserRepository {
  private typeormUserRepository: Repository<TypeormUser>;
  private typeormUserGroupProfileRepository: Repository<TypeormUserGroupProfile>;
  private readonly logger: LoggerService;

  constructor(dataSource: DataSource, @Optional() logger?: LoggerService) {
    this.typeormUserRepository = dataSource.getRepository(TypeormUser);
    this.typeormUserGroupProfileRepository = dataSource.getRepository(
      TypeormUserGroupProfile,
    );

    this.logger = logger || new Logger(TypeormUserRepository.name);
  }

  async createUser(user: User): Promise<boolean> {
    const mappedEntity = UserMapper.toOrmEntity([user]).at(0);
    if (!mappedEntity) return false;
    const { user: ormUser, userGroupProfile } = mappedEntity;

    const result = await this.typeormUserRepository
      .save(ormUser)
      .then(() => {
        return true;
      })
      .catch(() => {
        return false;
      });

    if (userGroupProfile.length === 0) {
      return result;
    }
    const groupProfileResult = await this.typeormUserGroupProfileRepository
      .save(userGroupProfile)
      .then(() => {
        return true;
      })
      .catch(() => {
        return false;
      });
    return result && groupProfileResult;
  }

  async updateUser(user: User): Promise<boolean> {
    const mappedEntity = UserMapper.toOrmEntity([user]).at(0);
    if (!mappedEntity) return false;
    const { user: ormUser, userGroupProfile } = mappedEntity;

    const result = await this.typeormUserRepository
      .save(ormUser)
      .then(() => {
        return true;
      })
      .catch(() => {
        return false;
      });

    if (userGroupProfile.length === 0) {
      return result;
    }
    const groupProfileResult = await this.typeormUserGroupProfileRepository
      .save(userGroupProfile)
      .then(() => {
        return true;
      })
      .catch(() => {
        return false;
      });
    return result && groupProfileResult;
  }

  async findUserById(id: UserId): Promise<Nullable<User>> {
    const ormUser = await this.typeormUserRepository
      .createQueryBuilder("user")
      .leftJoinAndSelect("user.groups", "group")
      .leftJoinAndSelect("user.ownGroups", "ownGroup")
      .leftJoinAndSelect("user.userGroupProfiles", "userGroupProfiles")
      .where("user.id = :id", { id })
      .andWhere("user.deletedDateTime is null")
      .getOne();

    if (!ormUser) {
      return null;
    }
    const groups = await ormUser.groups;
    const ownGroups = await ormUser.ownGroups;
    const userGroupProfile = await ormUser.userGroupProfiles;
    const { results, errors } = await UserMapper.toDomainEntity({
      elements: [
        {
          user: ormUser,
          groups,
          ownGroups,
          userGroupProfiles: userGroupProfile,
        },
      ],
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
      .leftJoinAndSelect("user.userGroupProfiles", "userGroupProfiles")
      .where("group.id = :groupId", { groupId: payload.groupId })
      .andWhere("user.username = :username", { username: payload.username })
      .andWhere("user.deletedDateTime is null")
      .getOne();
    if (!ormUser) {
      return null;
    }
    const groups = await ormUser.groups;
    const ownGroups = await ormUser.ownGroups;
    const userGroupProfiles = await ormUser.userGroupProfiles;

    const { results, errors } = await UserMapper.toDomainEntity({
      elements: [
        {
          user: ormUser,
          groups,
          ownGroups,
          userGroupProfiles,
        },
      ],
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
      .leftJoinAndSelect("user.userGroupProfiles", "userGroupProfiles")
      .where("group.id = :groupId", { groupId })
      .andWhere("user.deletedDateTime is null")
      .getMany();

    const elements = await Promise.all(
      ormUsers.map(async (ormUser) => {
        return {
          user: ormUser,
          groups: await ormUser.groups,
          ownGroups: await ormUser.ownGroups,
          userGroupProfiles: await ormUser.userGroupProfiles,
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
      .leftJoinAndSelect("user.userGroupProfiles", "userGroupProfiles")
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
    const userGroupProfiles = await ormUser.userGroupProfiles;

    const { results, errors } = await UserMapper.toDomainEntity({
      elements: [{ user: ormUser, groups, ownGroups, userGroupProfiles }],
    });
    errors.forEach((error) => {
      this.logger.error(error);
    });

    return results[0] || null;
  }
}
