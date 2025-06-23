import { Nullable } from '../../common/type/common-types';
import { SGroup, TGroup, TUserProfile } from './entity/group';
import { z } from 'zod';
import { TMemberRole, TMemberStatus, SMember, TMember } from './entity/member';

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

export interface IGroupRepository {
  /**
   * 유저 기본 프로필 조회
   */
  findUserProfile(userId: string): Promise<TUserProfile>;

  /**
   * Group CRUD
   */
  createGroup(payload: { groupName: string }): Promise<TGroup>;

  /**
   * 삭제되지 않은 그룹 조회
   */
  findGroupBy(
    payload:
      | {
          groupId: string;
        }
      | {
          invitationCode: string;
        }
  ): Promise<Nullable<TGroup>>;

  /**
   * 삭제되지 않은 그룹 목록 조회
   */
  findGroupListBy(
    payload: {
      userId: string;
      role?: TMemberRole;
      status?: 'approved' | 'pending';
    },
    pagination: TGroupPaginationParams
  ): Promise<TGroupPaginatedResult>;

  /**
   * 삭제되지 않은 그룹에 대한 정보 수정
   */
  updateGroup(
    groupId: string,
    group: {
      name?: string;
    }
  ): Promise<TGroup>;

  deleteGroup(groupId: string): Promise<boolean>;

  addMember(payload: {
    groupId: string;
    userId: string;
    role: TMemberRole;
    status: TMemberStatus;
    username: string;
    profileImageUrl?: string;
  }): Promise<TMember>;

  findMemberListBy(
    by: { groupId: string; status?: TMemberStatus } | { memberIds: string[] },
    pagination: TMemberPaginationParams
  ): Promise<TMemberPaginatedResult>;

  /**
   * memberId: 해당 멤버 반환
   * groupId, userId, status: 해당 유저의 그룹에 속한 멤버 정보 반환
   *
   * status가 'rejected', 'droppedOut', 'left' 인 경우 여러 엔티티를 가질 수 있어,
   * findMemberBy로 조회 불가.
   */
  findMemberBy(
    by:
      | {
          memberId: string;
        }
      | {
          groupId: string;
          userId: string;
          status: 'approved' | 'pending'; // TMemberStatus
        }
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
  // '존재하는' 그룹의 초대코드 반환
  findInvitationCodeBy(groupId: string): Promise<Nullable<string>>;

  // '존재하는' 그룹의 초대코드 저장
  saveInvitationCode(payload: {
    groupId: string;
    invitationCode: string;
  }): Promise<void>;

  // 그룹의 초대코드 삭제
  deleteInvitationCode(groupId: string): Promise<boolean>;
}
