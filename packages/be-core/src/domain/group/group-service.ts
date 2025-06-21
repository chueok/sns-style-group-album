import { Code } from '../../common/exception/code';
import { Exception } from '../../common/exception/exception';
import { TAcceptedMember, TGroup, TPendingMember } from './entity/group';
import {
  IGroupRepository,
  TGroupsPaginatedResult,
  TGroupsPaginationParams,
} from './group-repository.interface';

export class GroupService {
  constructor(private readonly groupRepository: IGroupRepository) {}

  /****************************************************
   * Group CRUD 함수
   ****************************************************/
  async createGroup(ownerId: string, name: string): Promise<TGroup> {
    const ownerDefaultProfile =
      await this.groupRepository.findUserProfile(ownerId);

    try {
      const group = await this.groupRepository.createGroup({
        groupName: name,
        ownerId,
        ownerUsername: ownerDefaultProfile.username,
        ownerProfileImageUrl: ownerDefaultProfile.profileImageUrl ?? undefined,
      });
      return group;
    } catch (error) {
      throw Exception.new({
        code: Code.BAD_REQUEST_ERROR,
        overrideMessage: 'Failed to create group',
      });
    }
  }

  async changeGroupOwner(payload: {
    requesterId: string;
    groupId: string;
    toBeOwnerId: string;
  }): Promise<TGroup> {
    const { requesterId, groupId, toBeOwnerId } = payload;
    const [isOwner, isMember] = await Promise.all([
      this.groupRepository.isOwner(groupId, requesterId),
      this.groupRepository.isApprovedMember(groupId, toBeOwnerId),
    ]);

    if (!isOwner) {
      throw Exception.new({
        code: Code.UNAUTHORIZED_ERROR,
        overrideMessage: 'requester not owner',
      });
    }

    if (!isMember) {
      throw Exception.new({
        code: Code.BAD_REQUEST_ERROR,
        overrideMessage: 'Owner not in group',
      });
    }

    const group = await this.groupRepository.updateGroup(groupId, {
      ownerId: toBeOwnerId,
    });
    return group;
  }

  async changeGroupName(payload: {
    requesterId: string;
    groupId: string;
    name: string;
  }): Promise<TGroup> {
    const { requesterId, groupId, name } = payload;
    const isOwner = await this.groupRepository.isOwner(groupId, requesterId);
    if (!isOwner) {
      throw Exception.new({
        code: Code.UNAUTHORIZED_ERROR,
        overrideMessage: 'requester not owner',
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
    const isOwner = await this.groupRepository.isOwner(groupId, requesterId);
    if (!isOwner) {
      throw Exception.new({
        code: Code.UNAUTHORIZED_ERROR,
        overrideMessage: 'requester not owner',
      });
    }

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
    pagination: TGroupsPaginationParams;
  }): Promise<TGroupsPaginatedResult<TGroup>> {
    const { requesterId, pagination } = payload;

    const groupList = await this.groupRepository.findGroupListBy(
      {
        memberId: requesterId,
      },
      pagination
    );
    return groupList;
  }

  async getMyOwnGroups(payload: {
    requesterId: string;
    pagination: TGroupsPaginationParams;
  }): Promise<TGroupsPaginatedResult<TGroup>> {
    const { requesterId, pagination } = payload;

    const ownGroupList = await this.groupRepository.findGroupListBy(
      {
        ownerId: requesterId,
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
    const isMember = await this.groupRepository.isApprovedMember(
      groupId,
      requesterId
    );
    if (!isMember) {
      throw Exception.new({
        code: Code.UNAUTHORIZED_ERROR,
        overrideMessage: 'requester not member',
      });
    }

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
    const isMember = await this.groupRepository.isApprovedMember(
      groupId,
      requesterId
    );
    if (!isMember) {
      throw Exception.new({
        code: Code.UNAUTHORIZED_ERROR,
        overrideMessage: 'requester not owner',
      });
    }

    const invitationCode =
      await this.groupRepository.getInvitationCode(groupId);
    return invitationCode;
  }

  async requestJoinGroup(payload: {
    requesterId: string;
    invitationCode: string;
  }): Promise<TPendingMember> {
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

    const [isMember, isPendingMember, defaultProfile] = await Promise.all([
      this.groupRepository.isApprovedMember(group.id, requesterId),
      this.groupRepository.isPendingMember(group.id, requesterId),
      this.groupRepository.findUserProfile(requesterId),
    ]);

    if (isMember) {
      throw Exception.new({
        code: Code.BAD_REQUEST_ERROR,
        overrideMessage: 'requester already member',
      });
    }

    if (isPendingMember) {
      throw Exception.new({
        code: Code.BAD_REQUEST_ERROR,
        overrideMessage: 'requester already requested join group',
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
  }): Promise<TPendingMember[]> {
    const { requesterId, groupId } = payload;
    const isOwner = await this.groupRepository.isOwner(groupId, requesterId);
    if (!isOwner) {
      throw Exception.new({
        code: Code.UNAUTHORIZED_ERROR,
        overrideMessage: 'requester not owner',
      });
    }

    const members = await this.groupRepository.findMembersBy(
      { groupId, status: 'pending' },
      {
        pageSize: 5,
      }
    );

    // joinDateTime가 있는 경우 제외하고 반환
    const pendingMembers = members.items.flatMap((member) => {
      if (member.joinDateTime) {
        return [];
      }
      return [
        {
          ...member,
          joinDateTime: undefined,
        },
      ];
    });
    return pendingMembers;
  }

  async approveJoinRequest(payload: {
    requesterId: string;
    groupId: string;
    memberId: string;
  }): Promise<TAcceptedMember> {
    const { requesterId, groupId, memberId } = payload;

    const [isOwner, isPendingMember] = await Promise.all([
      this.groupRepository.isOwner(groupId, requesterId),
      this.groupRepository.isPendingMember(groupId, memberId),
    ]);
    if (!isOwner) {
      throw Exception.new({
        code: Code.UNAUTHORIZED_ERROR,
        overrideMessage: 'requester not owner',
      });
    }
    if (!isPendingMember) {
      throw Exception.new({
        code: Code.BAD_REQUEST_ERROR,
        overrideMessage: 'the user is not requested join group',
      });
    }

    const result = await this.groupRepository.updateMember({
      groupId,
      userId: memberId,
      payload: {
        status: 'approved',
      },
    });

    if (!result) {
      throw Exception.new({
        code: Code.BAD_REQUEST_ERROR,
        overrideMessage: 'Failed to approve join request',
      });
    }

    const member = await this.findAnAcceptedMember({
      groupId,
      userId: memberId,
    });

    return member;
  }

  async rejectJoinRequest(payload: {
    requesterId: string;
    groupId: string;
    memberId: string;
  }): Promise<void> {
    const { requesterId, groupId, memberId } = payload;

    const isOwner = await this.groupRepository.isOwner(groupId, requesterId);
    if (!isOwner) {
      throw Exception.new({
        code: Code.UNAUTHORIZED_ERROR,
        overrideMessage: 'requester not owner',
      });
    }

    await this.groupRepository.updateMember({
      groupId,
      userId: memberId,
      payload: {
        status: 'rejected',
      },
    });

    return;
  }

  async dropOutMember(payload: {
    requesterId: string;
    groupId: string;
    memberId: string;
  }): Promise<void> {
    const { requesterId, groupId, memberId } = payload;
    const isOwner = await this.groupRepository.isOwner(groupId, requesterId);
    if (!isOwner) {
      throw Exception.new({
        code: Code.UNAUTHORIZED_ERROR,
        overrideMessage: 'requester not owner',
      });
    }

    await this.groupRepository.updateMember({
      groupId,
      userId: memberId,
      payload: {
        status: 'droppedOut',
      },
    });
  }

  async leaveGroup(payload: {
    requesterId: string;
    groupId: string;
  }): Promise<void> {
    const { requesterId, groupId } = payload;

    const [isOwner, isMember] = await Promise.all([
      this.groupRepository.isOwner(groupId, requesterId),
      this.groupRepository.isApprovedMember(groupId, requesterId),
    ]);
    if (isOwner) {
      throw Exception.new({
        code: Code.BAD_REQUEST_ERROR,
        overrideMessage: 'requester is owner',
      });
    }
    if (!isMember) {
      throw Exception.new({
        code: Code.UNAUTHORIZED_ERROR,
        overrideMessage: 'requester not member',
      });
    }

    await this.groupRepository.updateMember({
      groupId,
      userId: requesterId,
      payload: {
        status: 'left',
      },
    });
  }

  async getMembersByGroupId(payload: {
    requesterId: string;
    groupId: string;
    pagination: TGroupsPaginationParams;
  }): Promise<TGroupsPaginatedResult<TAcceptedMember>> {
    const { requesterId, groupId, pagination } = payload;
    const isMember = await this.groupRepository.isApprovedMember(
      groupId,
      requesterId
    );
    if (!isMember) {
      throw Exception.new({
        code: Code.UNAUTHORIZED_ERROR,
        overrideMessage: 'requester not member',
      });
    }

    const findMembersResult = await this.groupRepository.findMembersBy(
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

  async getMembersByUserIds(payload: {
    requesterId: string;
    groupId: string;
    userIds: string[];
  }): Promise<TAcceptedMember[]> {
    const { requesterId, userIds, groupId } = payload;

    const isMember = await this.groupRepository.isApprovedMember(
      groupId,
      requesterId
    );
    if (!isMember) {
      throw Exception.new({
        code: Code.UNAUTHORIZED_ERROR,
        overrideMessage: 'User is not in group',
      });
    }

    const members = await this.groupRepository.findMembersBy(
      {
        groupId,
        userIdList: userIds,
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

  private async findAnAcceptedMember(payload: {
    groupId: string;
    userId: string;
  }): Promise<TAcceptedMember> {
    const { groupId, userId } = payload;
    const members = await this.groupRepository.findMembersBy(
      { groupId, userIdList: [userId], status: 'approved' },
      {
        pageSize: 1,
      }
    );
    const member = members.items.at(0);
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
}
