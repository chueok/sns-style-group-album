import { Nullable } from '../../common/type/common-types';
import { TGroup, TMember, TMemberProfile } from './entity/group';
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
  findUserProfile(userId: string): Promise<TMemberProfile>;

  /****************************************************
   * 권한 확인을 위한 함수
   ****************************************************/
  isOwner(groupId: string, userId: string): Promise<boolean>;

  isApprovedMember(groupId: string, userId: string): Promise<boolean>;

  /**
   * Group CRUD
   */
  createGroup(payload: {
    groupName: string;
    ownerId: string;
    ownerUsername: string;
    ownerProfileImageUrl?: string;
  }): Promise<TGroup>;

  findGroupBy(payload: {
    groupId?: string;
    invitationCode?: string;
  }): Promise<Nullable<TGroup>>;

  findGroupListBy(
    payload: {
      ownerId?: string;
      memberId?: string;
    },
    pagination: TGroupsPaginationParams
  ): Promise<TGroupsPaginatedResult<TGroup>>;

  updateGroup(
    groupId: string,
    group: {
      ownerId?: string;
      name?: string;
    }
  ): Promise<TGroup>;

  deleteGroup(groupId: string): Promise<boolean>;

  /****************************************************
   * 멤버 관리를 위한 함수 모음
   ****************************************************/
  isPendingMember(groupId: string, userId: string): Promise<boolean>;

  addMember(payload: {
    groupId: string;
    userId: string;
    role: TMemberRole;
    status: TMemberStatus;
    username: string;
    profileImageUrl?: string;
  }): Promise<TMember>;

  findMembersBy(
    by: { groupId: string; userIdList?: string[]; status?: TMemberStatus },
    pagination: TGroupsPaginationParams
  ): Promise<TGroupsPaginatedResult<TMember>>;

  updateMember(payload: {
    groupId: string;
    userId: string;
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
  getInvitationCode(groupId: string): Promise<string>;
  refreshInvitationCode(groupId: string): Promise<string>;
  deleteInvitationCode(groupId: string): Promise<boolean>;
}
