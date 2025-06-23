import z from 'zod';
import { Code } from '../../common/exception/code';
import { Exception } from '../../common/exception/exception';
import {
  ESystemCommentCategory,
  ISystemContentCommentPort,
} from '../../common/port/system-comment-port.interface';
import {
  SMemberDTO,
  TAcceptedMemberDTO,
  TPendingMemberDTO,
} from './dto/member';
import { TGroup } from './entity/group';
import {
  IGroupRepository,
  SMemberPaginatedResultFactory,
  TGroupPaginatedResult,
  TGroupPaginationParams,
  TMemberPaginationParams,
} from './group-repository.interface';
import { TMember } from './entity/member';
import { Transactional } from 'typeorm-transactional';

/**
 * member response schema
 * group 의 경우 필요 할 때 도입 예정
 */
export const SMemberDtoPaginatedResult =
  SMemberPaginatedResultFactory(SMemberDTO);
export type TMemberDtoPaginatedResult = z.infer<
  typeof SMemberDtoPaginatedResult
>;

export class GroupService {
  constructor(
    private readonly groupRepository: IGroupRepository,
    private readonly systemContentCommentPort: ISystemContentCommentPort
  ) {}

  /****************************************************
   * Group CRUD 함수
   ****************************************************/
  @Transactional()
  async createGroup(requesterId: string, name: string): Promise<TGroup> {
    const ownerDefaultProfile =
      await this.groupRepository.findUserProfile(requesterId);

    try {
      const group = await this.groupRepository.createGroup({
        groupName: name,
      });

      const groupOwner = await this.groupRepository.addMember({
        groupId: group.id,
        userId: requesterId,
        role: 'owner',
        status: 'approved',
        profileImageUrl: ownerDefaultProfile.profileImageUrl,
        username: ownerDefaultProfile.username,
      });

      void this.systemContentCommentPort.addComment({
        groupId: group.id,
        category: ESystemCommentCategory.GROUP_CREATED,
        text: `님이 그룹을 생성했습니다.`,
        tags: [
          {
            at: [0],
            memberId: groupOwner.id,
          },
        ],
      });

      return group;
    } catch (error) {
      throw Exception.new({
        code: Code.BAD_REQUEST_ERROR,
        overrideMessage: 'Failed to create group',
      });
    }
  }

  @Transactional()
  async changeGroupOwner(payload: {
    requesterId: string;
    groupId: string;
    toBeOwnerId: string;
  }): Promise<void> {
    const { requesterId, groupId, toBeOwnerId } = payload;

    const [owner, toBeOwner] = await Promise.all([
      this.verifyOwner({
        userId: requesterId,
        groupId,
      }),
      this.groupRepository.findMemberBy({
        memberId: toBeOwnerId,
      }),
    ]);

    if (!toBeOwner || toBeOwner.status !== 'approved') {
      throw Exception.new({
        code: Code.ENTITY_NOT_FOUND_ERROR,
        overrideMessage: 'Only approved member can be owner',
      });
    }

    await this.groupRepository.updateMember({
      memberId: owner.id,
      payload: {
        role: 'member',
      },
    });

    await this.groupRepository.updateMember({
      memberId: toBeOwnerId,
      payload: {
        role: 'owner',
      },
    });

    return;
  }

  async changeGroupName(payload: {
    requesterId: string;
    groupId: string;
    name: string;
  }): Promise<TGroup> {
    const { requesterId, groupId, name } = payload;

    const [_, targetGroup] = await Promise.all([
      this.verifyOwner({
        userId: requesterId,
        groupId,
      }),
      this.groupRepository.findGroupBy({
        groupId,
      }),
    ]);
    if (!targetGroup) {
      throw Exception.new({
        code: Code.ENTITY_NOT_FOUND_ERROR,
        overrideMessage: 'Group not found',
      });
    }

    const group = await this.groupRepository.updateGroup(groupId, { name });
    return group;
  }

  async deleteGroup(payload: {
    requesterId: string;
    groupId: string;
  }): Promise<void> {
    const { requesterId, groupId } = payload;
    await this.verifyOwner({
      userId: requesterId,
      groupId,
    });

    const result = await this.groupRepository.deleteGroup(groupId);
    if (!result) {
      throw Exception.new({
        code: Code.BAD_REQUEST_ERROR,
        overrideMessage: 'Failed to delete group',
      });
    }
  }

  async getMyMemberGroups(payload: {
    requesterId: string;
    pagination: TGroupPaginationParams;
  }): Promise<TGroupPaginatedResult> {
    const { requesterId, pagination } = payload;

    const groupList = await this.groupRepository.findGroupListBy(
      {
        userId: requesterId,
        status: 'approved',
      },
      pagination
    );
    return groupList;
  }

  async getMyOwnGroups(payload: {
    requesterId: string;
    pagination: TGroupPaginationParams;
  }): Promise<TGroupPaginatedResult> {
    const { requesterId, pagination } = payload;

    const ownGroupList = await this.groupRepository.findGroupListBy(
      {
        userId: requesterId,
        role: 'owner',
        status: 'approved',
      },
      pagination
    );
    return ownGroupList;
  }

  async getGroup(payload: {
    requesterId: string;
    groupId: string;
  }): Promise<TGroup> {
    const { requesterId, groupId } = payload;

    await this.verifyApprovedMember({
      groupId,
      userId: requesterId,
    });

    const group = await this.groupRepository.findGroupBy({
      groupId,
    });
    if (!group) {
      throw Exception.new({
        code: Code.ENTITY_NOT_FOUND_ERROR,
        overrideMessage: 'Group not found',
      });
    }
    return group;
  }

  /****************************************************
   * 멤버 CRUD 및 초대 함수
   ****************************************************/
  async getInvitationCode(payload: {
    requesterId: string;
    groupId: string;
  }): Promise<string> {
    const { requesterId, groupId } = payload;
    await this.verifyApprovedMember({
      groupId,
      userId: requesterId,
    });

    const invitationCode =
      await this.groupRepository.getInvitationCode(groupId);
    return invitationCode;
  }

  async requestJoinGroup(payload: {
    requesterId: string;
    invitationCode: string;
  }): Promise<TPendingMemberDTO> {
    const { requesterId, invitationCode } = payload;

    const group = await this.groupRepository.findGroupBy({
      invitationCode,
    });
    if (!group) {
      throw Exception.new({
        code: Code.ENTITY_NOT_FOUND_ERROR,
        overrideMessage: 'Group not found',
      });
    }

    const [pendingMember, approvedMember, defaultProfile] = await Promise.all([
      this.groupRepository.findMemberBy({
        groupId: group.id,
        userId: requesterId,
        status: 'pending',
      }),
      this.groupRepository.findMemberBy({
        groupId: group.id,
        userId: requesterId,
        status: 'approved',
      }),
      this.groupRepository.findUserProfile(requesterId),
    ]);
    if (pendingMember) {
      throw Exception.new({
        code: Code.BAD_REQUEST_ERROR,
        overrideMessage: 'requester already requested join group',
      });
    }
    if (approvedMember) {
      throw Exception.new({
        code: Code.BAD_REQUEST_ERROR,
        overrideMessage: 'requester already member',
      });
    }

    const newMember = await this.groupRepository.addMember({
      groupId: group.id,
      userId: requesterId,
      role: 'member',
      status: 'pending',
      profileImageUrl: defaultProfile.profileImageUrl ?? undefined,
      username: defaultProfile.username,
    });

    return {
      ...newMember,
      joinDateTime: undefined,
    };
  }

  async getJoinRequestUsers(payload: {
    requesterId: string;
    groupId: string;
  }): Promise<TPendingMemberDTO[]> {
    const { requesterId, groupId } = payload;
    await this.verifyOwner({
      userId: requesterId,
      groupId,
    });

    const members = await this.groupRepository.findMemberListBy(
      { groupId, status: 'pending' },
      {
        pageSize: 5,
      }
    );

    const pendingMembers = members.items.map((member) => {
      return {
        ...member,
        joinDateTime: undefined,
      };
    });
    return pendingMembers;
  }

  async approveJoinRequest(payload: {
    requesterId: string;
    memberId: string;
  }): Promise<TAcceptedMemberDTO> {
    const { requesterId, memberId } = payload;

    const owner = await this.groupRepository.findOwnerBy({
      memberId,
    });

    if (owner.userId !== requesterId) {
      throw Exception.new({
        code: Code.UNAUTHORIZED_ERROR,
        overrideMessage: 'requester not owner',
      });
    }

    const targetMember = await this.groupRepository.findMemberBy({
      memberId,
    });

    if (!targetMember || targetMember.status !== 'pending') {
      throw Exception.new({
        code: Code.BAD_REQUEST_ERROR,
        overrideMessage: 'the member is not requested join group',
      });
    }

    const result = await this.groupRepository.updateMember({
      memberId,
      payload: {
        status: 'approved',
      },
    });

    if (!result) {
      throw Exception.new({
        code: Code.BAD_REQUEST_ERROR,
        overrideMessage: 'Failed to update member status',
      });
    }

    const updatedMember = await this.groupRepository.findMemberBy({
      memberId,
    });
    if (!updatedMember || !updatedMember.joinDateTime) {
      throw Exception.new({
        code: Code.BAD_REQUEST_ERROR,
        overrideMessage: 'Failed to find member',
      });
    }

    void this.systemContentCommentPort.addComment({
      groupId: owner.groupId,
      category: ESystemCommentCategory.MEMBER_JOINED,
      text: `님이 그룹에 가입했습니다.`,
      tags: [
        {
          at: [0],
          memberId,
        },
      ],
    });

    return {
      ...updatedMember,
      joinDateTime: updatedMember.joinDateTime,
    };
  }

  async rejectJoinRequest(payload: {
    requesterId: string;
    memberId: string;
  }): Promise<void> {
    const { requesterId, memberId } = payload;

    const owner = await this.groupRepository.findOwnerBy({
      memberId,
    });

    if (owner.userId !== requesterId) {
      throw Exception.new({
        code: Code.UNAUTHORIZED_ERROR,
        overrideMessage: 'requester not owner',
      });
    }

    const targetMember = await this.groupRepository.findMemberBy({
      memberId,
    });
    if (!targetMember || targetMember.status !== 'pending') {
      throw Exception.new({
        code: Code.BAD_REQUEST_ERROR,
        overrideMessage: 'the member is not requested join group',
      });
    }

    await this.groupRepository.updateMember({
      memberId,
      payload: {
        status: 'rejected',
      },
    });

    return;
  }

  async dropOutMember(payload: {
    requesterId: string;
    memberId: string;
  }): Promise<void> {
    const { requesterId, memberId } = payload;

    const owner = await this.groupRepository.findOwnerBy({
      memberId,
    });

    if (owner.userId !== requesterId) {
      throw Exception.new({
        code: Code.UNAUTHORIZED_ERROR,
        overrideMessage: 'requester not owner',
      });
    }

    await this.groupRepository.updateMember({
      memberId: memberId,
      payload: {
        status: 'droppedOut',
      },
    });

    void this.systemContentCommentPort.addComment({
      groupId: owner.groupId,
      category: ESystemCommentCategory.MEMBER_DROP_OUT,
      text: `님이 그룹에서 강퇴되었습니다.`,
      tags: [
        {
          at: [0],
          memberId: memberId,
        },
      ],
    });
  }

  async leaveGroup(payload: {
    requesterId: string;
    groupId: string;
  }): Promise<void> {
    const { requesterId, groupId } = payload;

    const requestedMember = await this.verifyOwner({
      userId: requesterId,
      groupId,
    });

    await this.groupRepository.updateMember({
      memberId: requestedMember.id,
      payload: {
        status: 'left',
      },
    });

    void this.systemContentCommentPort.addComment({
      groupId,
      category: ESystemCommentCategory.MEMBER_LEFT,
      text: `님이 그룹에서 나갔습니다.`,
      tags: [
        {
          at: [0],
          memberId: requesterId,
        },
      ],
    });
  }

  async getMembersByGroupId(payload: {
    requesterId: string;
    groupId: string;
    pagination: TMemberPaginationParams;
  }): Promise<TMemberDtoPaginatedResult> {
    const { requesterId, groupId, pagination } = payload;

    await this.verifyApprovedMember({
      groupId,
      userId: requesterId,
    });

    const findMembersResult = await this.groupRepository.findMemberListBy(
      { groupId, status: 'approved' },
      pagination
    );

    // Type 변환 (TMember -> TAcceptedMember)
    // 그 과정에서 맞지 않는 데이터 있으면 에러 발생
    const acceptedMembers = findMembersResult.items.flatMap((member) => {
      if (!member.joinDateTime) {
        return [];
      }
      return {
        ...member,
        joinDateTime: member.joinDateTime,
      };
    });
    if (acceptedMembers.length !== findMembersResult.items.length) {
      throw Exception.new({
        code: Code.BAD_REQUEST_ERROR,
        overrideMessage: 'Failed to get members by group id',
      });
    }

    return {
      page: findMembersResult.page,
      pageSize: findMembersResult.pageSize,
      totalPages: findMembersResult.totalPages,
      total: acceptedMembers.length,
      items: acceptedMembers,
    };
  }

  async getMembersByMemberIds(payload: {
    requesterId: string;
    groupId: string;
    memberIds: string[];
  }): Promise<TAcceptedMemberDTO[]> {
    const { requesterId, memberIds, groupId } = payload;

    await this.verifyApprovedMember({
      groupId,
      userId: requesterId,
    });

    const members = await this.groupRepository.findMemberListBy(
      {
        groupId,
        memberIds,
        status: 'approved',
      },
      {
        pageSize: 100,
      }
    );

    const acceptedMembers = members.items.flatMap((member) => {
      if (!member.joinDateTime) {
        return [];
      }
      return {
        ...member,
        joinDateTime: member.joinDateTime,
      };
    });
    if (acceptedMembers.length !== members.items.length) {
      throw Exception.new({
        code: Code.BAD_REQUEST_ERROR,
        overrideMessage: 'Failed to get members by user ids',
      });
    }

    return acceptedMembers;
  }

  async getMyMemberInfo(payload: {
    requesterId: string;
    groupId: string;
  }): Promise<TAcceptedMemberDTO> {
    const { requesterId, groupId } = payload;

    const member = await this.groupRepository.findMemberBy({
      groupId,
      userId: requesterId,
      status: 'approved',
    });
    if (!member || !member.joinDateTime) {
      throw Exception.new({
        code: Code.ENTITY_NOT_FOUND_ERROR,
        overrideMessage: 'Member not found',
      });
    }

    return {
      ...member,
      joinDateTime: member.joinDateTime,
    };
  }

  /**
   * userId, groupId로 조회한 멤버가 owner인지 확인 후 member 반환
   */
  private async verifyOwner(payload: {
    userId: string;
    groupId: string;
  }): Promise<TMember> {
    const { userId, groupId } = payload;
    const member = await this.groupRepository.findMemberBy({
      groupId,
      userId,
      status: 'approved',
    });
    if (!member) {
      throw Exception.new({
        code: Code.ENTITY_NOT_FOUND_ERROR,
        overrideMessage: 'Member not found',
      });
    }
    if (member.role !== 'owner') {
      throw Exception.new({
        code: Code.BAD_REQUEST_ERROR,
        overrideMessage: 'member is not owner',
      });
    }
    return member;
  }

  private async verifyApprovedMember(payload: {
    groupId: string;
    userId: string;
  }): Promise<TMember> {
    const { groupId, userId } = payload;
    const member = await this.groupRepository.findMemberBy({
      groupId,
      userId,
      status: 'approved',
    });
    if (!member || member.status !== 'approved') {
      throw Exception.new({
        code: Code.BAD_REQUEST_ERROR,
        overrideMessage: 'member is not approved',
      });
    }
    return member;
  }
}
