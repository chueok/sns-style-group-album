import { Nullable } from '../../common/type/common-types';
import { TGroup, TGroupMember } from './entity/group';
import { z } from 'zod';

export const SGroupsPaginationParams = z.object({
  page: z.number().nullish(),
  pageSize: z.number(),
});

export type TGroupsPaginationParams = z.infer<typeof SGroupsPaginationParams>;

export type TGroupsPaginatedResult<T> = {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

export interface IGroupRepository {
  createGroup(payload: { ownerId: string; name: string }): Promise<TGroup>;

  updateGroup(
    groupId: string,
    group: {
      ownerId?: string;
      name?: string;
    }
  ): Promise<TGroup>;

  deleteGroup(groupId: string): Promise<boolean>;

  findGroupById(groupId: string): Promise<Nullable<TGroup>>;

  findGroupsByOwnerId(payload: {
    ownerId: string;
    pagination: TGroupsPaginationParams;
  }): Promise<TGroupsPaginatedResult<TGroup>>;

  findGroupsByMemberId(payload: {
    userId: string;
    pagination: TGroupsPaginationParams;
  }): Promise<TGroupsPaginatedResult<TGroup>>;

  /****************************************************
   * 멤버 관리를 위한 함수 모음
   ****************************************************/
  addMembers(groupId: string, memberIdList: string[]): Promise<boolean>;

  deleteMembers(groupId: string, memberIdList: string[]): Promise<boolean>;

  findMembers(
    groupId: string,
    pagination: TGroupsPaginationParams
  ): Promise<TGroupsPaginatedResult<TGroupMember>>;

  /****************************************************
   * 권한 확인을 위한 함수 모음
   ****************************************************/
  isOwner(groupId: string, userId: string): Promise<boolean>;

  isMember(groupId: string, userId: string): Promise<boolean>;

  /****************************************************
   * 멤버 초대를 위한 함수 모음
   ****************************************************/
  generateInvitationCode(groupId: string): Promise<string>;

  getInvitationCode(groupId: string): Promise<string>;

  deleteInvitationCode(groupId: string): Promise<boolean>;

  findJoinRequestUserList(groupId: string): Promise<TGroupMember[]>;

  isJoinRequestUser(groupId: string, userId: string): Promise<boolean>;

  /**
   * 첫번째 파라미터로 groupId 가 아닌 code를 받고 있음.
   * 도메인 친화적으로 repository interface 설계하였음.
   */
  addJoinRequestUsers(code: string, userIdList: string[]): Promise<boolean>;

  deleteJoinRequestUsers(
    groupId: string,
    userIdList: string[]
  ): Promise<boolean>;
}
