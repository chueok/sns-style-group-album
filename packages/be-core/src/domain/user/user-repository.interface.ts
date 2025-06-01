import { Nullable } from '../../common/type/common-types';
import { TUser } from './entity/user';

export type TEditableUser = Pick<TUser, 'username' | 'profileImageUrl'>;

/**
 * user 로직을 수행하기 위한 entity 와
 * 단순히 데이터를 보여주기 위한 entity를 분리해야 할까?
 */
export interface IUserRepository {
  updateUser(userId: string, user: Partial<TEditableUser>): Promise<boolean>;

  findUserById(id: string): Promise<Nullable<TUser>>;

  findUsersByGroupId(groupId: string): Promise<TUser[]>;

  updateGroupProfile(payload: {
    userId: string;
    groupId: string;
    username?: string;
    profileImageUrl?: string;
  }): Promise<TUser>;

  isUserInGroup(userId: string, groupId: string): Promise<boolean>;

  deleteUser(userId: string): Promise<void>;
}
