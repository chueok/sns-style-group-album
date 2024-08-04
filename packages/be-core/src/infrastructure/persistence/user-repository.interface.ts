import { Nullable } from "../../common/type/common-types";
import { User } from "../../domain/user/entity/user";

export interface IUserRepository {
  createUser(user: User): Promise<User>;

  updateUser(user: User): Promise<User>;

  deleteUser(id: string): Promise<boolean>;

  findUserById(id: string): Promise<Nullable<User>>;

  findUserByGroupId(groupId: string): Promise<User[]>;

  findUserByUsernameOfGroup(payload: {
    username: string;
    groupId: string;
  }): Promise<Nullable<User>>;
}
