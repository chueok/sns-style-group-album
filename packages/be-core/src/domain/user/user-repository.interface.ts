import { Nullable } from '../../common/type/common-types';
import { TUser } from './entity/user';

export type TEditableUser = Pick<TUser, 'username' | 'profileImageUrl'>;

/**
 * user 로직을 수행하기 위한 entity 와
 * 단순히 데이터를 보여주기 위한 entity를 분리해야 할까?
 */
export interface IUserRepository {
  /**
   * user RUD
   * Create는 Auth 담당
   */

  // '삭제되지 않은' 유저 조회
  findUserById(id: string): Promise<Nullable<TUser>>;

  // '삭제되지 않은' 유저 정보 수정
  updateUser(userId: string, updateObj: Partial<TEditableUser>): Promise<void>;

  deleteUser(userId: string): Promise<void>;
}
