import { TJwtUser } from './type/jwt-user';
import { Nullable } from '@repo/be-core';

export interface IAuthRepository {
  createUser(payload: {
    provider: string;
    providerId: string;
    profileUrl?: string;
    email?: string;
  }): Promise<TJwtUser>;

  /**
   * provider와 providerId로 회원 정보를 조회
   */
  getOauthUser(
    provider: string,
    providerId: string
  ): Promise<Nullable<TJwtUser>>;

  // getUser(payload: { id: string }): Promise<TJwtUser>;

  // getGroupMember(payload: {
  //   userId: string;
  //   groupId: string;
  // }): Promise<TJwtUser>;

  // getGroupOwner(payload: {
  //   userId: string;
  //   groupId: string;
  // }): Promise<TJwtUser>;

  // getContentOwner(payload: {
  //   userId: string;
  //   groupId: string;
  //   contentId: string;
  // }): Promise<TJwtUser>;

  // getCommentOwner(payload: {
  //   userId: string;
  //   groupId: string;
  //   commentId: string;
  // }): Promise<TJwtUser>;
}
