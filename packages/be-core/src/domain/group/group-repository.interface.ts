import { Nullable } from '../../common/type/common-types';
import { TGroup, TGroupJoinRequestUser, TGroupMember } from './entity/group';
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
  // invitation code가 없을 경우 생성하고 반환
  getInvitationCode(groupId: string): Promise<string>;
  refreshInvitationCode(groupId: string): Promise<string>;
  deleteInvitationCode(groupId: string): Promise<boolean>;

  findJoinRequestUsers(groupId: string): Promise<TGroupJoinRequestUser[]>;

  isJoinRequestUser(groupId: string, userId: string): Promise<boolean>;

  findGroupByInvitationCode(code: string): Promise<Nullable<TGroup>>;

  addJoinRequestUsers(groupId: string, userIdList: string[]): Promise<boolean>;

  // 두가지 입력을 처리하다 보니, 함수 이름은 도메인을 반영하여 작성함
  // 유저 여러명을 동시에 처리하기에는, transactional 처리가 복잡해져서, 단일 유저에 대한 인터페이스 구현
  approveJoinRequestUser(groupId: string, userId: string): Promise<boolean>;
  rejectJoinRequestUser(groupId: string, userId: string): Promise<boolean>;
}
