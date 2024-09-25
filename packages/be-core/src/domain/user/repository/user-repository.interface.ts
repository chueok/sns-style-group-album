import { Nullable } from "../../../common/type/common-types";
import { User } from "../entity/user";

export interface IUserRepository {
  createUser(user: User): Promise<boolean>;

  updateUser(user: User): Promise<boolean>;

  findUserById(id: string): Promise<Nullable<User>>;

  findUserListByGroupId(groupId: string): Promise<User[]>;

  findUserByUsernameOfGroup(payload: {
    username: string;
    groupId: string;
  }): Promise<Nullable<User>>;

  findUserByOauth(payload: {
    provider: string;
    providerId: string;
  }): Promise<Nullable<User>>;

  // TODO : delete 는 user entity 에서 수행되어야 함.
  deleteUserById(id: string): Promise<boolean>;
}
