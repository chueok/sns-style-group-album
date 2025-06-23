import { Nullable } from '../../common/type/common-types';
import { SGroup, SMember, TGroup, TMember, TUserProfile } from './entity/group';
import { z } from 'zod';

/**
 * 멤버 요구사항
 * 1. 멤버는 다섯가지 상태(status)를 가지며 각각 아래와 같다.
 * 1.1. pending - 멤버 초대 요청 상태
 * 1.2. approved - 멤버 초대 승인 상태
 * 1.3. rejected - 멤버 초대 거절 상태
 * 1.4. droppedOut - 멤버 탈퇴 상태
 * 1.5. left - 멤버 외부 상태
 *
 * 2. 멤버 롤(role)은 두가지가 있으며 각각 아래와 같다.
 * 2.1. owner - 그룹의 소유자로, 한 그룹에 한 명만 존재 가능하다.
 * 2.2. member - 그룹의 일반 멤버로, 그룹에 속해있으며 그룹의 소유자는 멤버의 상태를 변경할 수 있다.
 *
 * 3. 상태가 approved인 멤버만 유효한 멤버이다.
 */

/**
 * 1. group pagination
 */
export const SGroupPaginationParams = z.object({
  page: z.number().nullish(),
  pageSize: z.number(),
});
export type TGroupPaginationParams = z.infer<typeof SGroupPaginationParams>;

export const SGroupPaginatedResultFactory = (schema: z.ZodTypeAny) =>
  z.object({
    items: z.array(schema),
    total: z.number(),
    page: z.number(),
    pageSize: z.number(),
    totalPages: z.number(),
  });

export const SGroupPaginatedResult = SGroupPaginatedResultFactory(SGroup);
export type TGroupPaginatedResult = z.infer<typeof SGroupPaginatedResult>;

/**
 * 2. member pagination
 */
export const SMemberPaginationParams = z.object({
  page: z.number().nullish(),
  pageSize: z.number(),
});
export type TMemberPaginationParams = z.infer<typeof SMemberPaginationParams>;

export const SMemberPaginatedResultFactory = (schema: z.ZodTypeAny) =>
  z.object({
    items: z.array(schema),
    total: z.number(),
    page: z.number(),
    pageSize: z.number(),
    totalPages: z.number(),
  });

export const SMemberPaginatedResult = SMemberPaginatedResultFactory(SMember);
export type TMemberPaginatedResult = z.infer<typeof SMemberPaginatedResult>;

/**
 * 3. other types
 */
export type TMemberRole = 'owner' | 'member';
export type TMemberStatus =
  | 'pending'
  | 'approved'
  | 'rejected'
  | 'droppedOut'
  | 'left';

export interface IGroupRepository {
  /**
   * 유저 기본 프로필 조회
   */
  findUserProfile(userId: string): Promise<TUserProfile>;

  /****************************************************
   * 권한 확인을 위한 함수
   ****************************************************/
  isOwner(groupId: string, userId: string): Promise<boolean>;

  isApprovedMember(groupId: string, userId: string): Promise<boolean>;

  /**
   * Group CRUD
   */
  createGroup(payload: { groupName: string }): Promise<TGroup>;

  findGroupBy(payload: {
    groupId?: string;
    invitationCode?: string;
  }): Promise<Nullable<TGroup>>;

  findGroupListBy(
    payload: {
      userId: string;
      role?: TMemberRole;
    },
    pagination: TGroupPaginationParams
  ): Promise<TGroupPaginatedResult>;

  updateGroup(
    groupId: string,
    group: {
      name?: string;
    }
  ): Promise<TGroup>;

  deleteGroup(groupId: string): Promise<boolean>;

  /****************************************************
   * 멤버 관리를 위한 함수 모음
   ****************************************************/
  isPendingMember(groupId: string, memberId: string): Promise<boolean>;

  addMember(payload: {
    groupId: string;
    userId: string;
    role: TMemberRole;
    status: TMemberStatus;
    username: string;
    profileImageUrl?: string;
  }): Promise<TMember>;

  findMemberListBy(
    by: { groupId: string; memberIds?: string[]; status?: TMemberStatus },
    pagination: TMemberPaginationParams
  ): Promise<TMemberPaginatedResult>;

  /**
   * memberId: 해당 멤버 반환
   * groupId, userId: 해당 유저의 그룹에 속한 멤버 정보 반환
   */
  findMemberBy(
    by:
      | {
          memberId?: string;
        }
      | { groupId: string; userId: string }
  ): Promise<Nullable<TMember>>;

  /**
   * groupId: 해당 그룹의 오너 반환
   * memberId: 해당 멤버의 그룹 오너 반환
   */
  findOwnerBy(by: { groupId: string } | { memberId: string }): Promise<TMember>;

  updateMember(payload: {
    memberId: string;
    payload: {
      username?: string;
      role?: TMemberRole;
      status?: TMemberStatus;
      profileImageUrl?: string;
    };
  }): Promise<boolean>;

  /****************************************************
   * 멤버 초대를 위한 함수 모음
   ****************************************************/
  // invitation code가 없을 경우 생성하고 반환
  // TODO: CRUD만 남기고, 비즈니스 로직은 service로 옮길 것
  getInvitationCode(groupId: string): Promise<string>;
  refreshInvitationCode(groupId: string): Promise<string>;
  deleteInvitationCode(groupId: string): Promise<boolean>;
}
