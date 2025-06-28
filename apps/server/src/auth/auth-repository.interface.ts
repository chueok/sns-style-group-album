import { TJwtUser } from './type/jwt-user';
import { Nullable } from '@repo/be-core';

export interface IAuthRepository {
  createUser(payload: {
    provider: string;
    providerId: string;
    profileUrl?: string;
    email?: string;
  }): Promise<TJwtUser>;

  getUser(userId: string): Promise<Nullable<TJwtUser>>;

  /**
   * provider와 providerId로 회원 정보를 조회
   */
  getOauthUser(
    provider: string,
    providerId: string
  ): Promise<Nullable<TJwtUser>>;

  /**
   * refresh token을 저장
   */
  saveRefreshToken(userId: string, refreshToken: string): Promise<void>;

  clearRefreshToken(userId: string): Promise<void>;

  /**
   * refresh token 유효성 검증
   * db 값이랑 비교하기 때문에 repository에서 검증하도록 함.
   */
  validateRefreshToken(userId: string, refreshToken: string): Promise<boolean>;

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
