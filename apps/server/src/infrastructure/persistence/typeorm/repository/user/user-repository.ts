import { IUserRepository, Nullable, User, UserId } from "@repo/be-core";
import { DataSource, Repository } from "typeorm";
import { TypeormUser } from "../../entity/user/typeorm-user.entity";
import { UserMapper } from "./mapper/user-mapper";

export class TypeormUserRepository implements IUserRepository {
  private typeormUserRepository: Repository<TypeormUser>;

  constructor(dataSource: DataSource) {
    this.typeormUserRepository = dataSource.getRepository(TypeormUser);
  }

  async createUser(user: User): Promise<boolean> {
    const ormEntity = UserMapper.toOrmEntity(user);
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
    return this.typeormUserRepository
      .update(user.id, UserMapper.toOrmEntity(user))
      .then(() => true)
      .catch(() => false);
  }

  async findUserById(id: UserId): Promise<Nullable<User>> {
    const ormUser = await this.typeormUserRepository.findOneBy({ id });
    if (!ormUser) {
      return null;
    }
    return UserMapper.toDomainEntity(ormUser);
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
    return UserMapper.toDomainEntity(ormUser);
  }

  async findUserListByGroupId(groupId: string): Promise<User[]> {
    const ormUsers = await this.typeormUserRepository
      .createQueryBuilder("user")
      .innerJoinAndSelect("user.groups", "group")
      .where("group.id = :groupId", { groupId })
      .getMany();

    return UserMapper.toDomainEntity(ormUsers);
  }
}
