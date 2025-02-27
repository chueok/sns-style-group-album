import { Nullable } from "../../../common/type/common-types";
import { SimpleUserDTO } from "../dto/simple-user-dto";
import { User } from "../entity/user";

/**
 * user 로직을 수행하기 위한 entity 와
 * 단순히 데이터를 보여주기 위한 entity를 분리해야 할까?
 */
export interface IUserRepository {
  createUser(user: User): Promise<boolean>;

  updateUser(user: User): Promise<boolean>;

  findUserById(id: string): Promise<Nullable<User>>;

  findUserListByGroupId(groupId: string): Promise<User[]>;
}
