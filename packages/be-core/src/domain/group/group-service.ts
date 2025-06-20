import { Code } from '../../common/exception/code';
import { Exception } from '../../common/exception/exception';
import { TGroup, TGroupJoinRequestUser, TGroupMember } from './entity/group';
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
    const group = await this.groupRepository.createGroup({ ownerId, name });
    return group;
  }

  async changeGroupOwner(payload: {
    requesterId: string;
    groupId: string;
    toBeOwnerId: string;
  }): Promise<TGroup> {
    const { requesterId, groupId, toBeOwnerId } = payload;
    const [isOwner, isMember] = await Promise.all([
      this.groupRepository.isOwner(groupId, requesterId),
      this.groupRepository.isMember(groupId, toBeOwnerId),
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

    const groupList = await this.groupRepository.findGroupsByMemberId({
      userId: requesterId,
      pagination,
    });
    return groupList;
  }

  async getMyOwnGroups(payload: {
    requesterId: string;
    pagination: TGroupsPaginationParams;
  }): Promise<TGroupsPaginatedResult<TGroup>> {
    const { requesterId, pagination } = payload;

    const ownGroupList = await this.groupRepository.findGroupsByOwnerId({
      ownerId: requesterId,
      pagination,
    });
    return ownGroupList;
  }

  async getGroup(payload: {
    requesterId: string;
    groupId: string;
  }): Promise<TGroup> {
    const { requesterId, groupId } = payload;
    const isMember = await this.groupRepository.isMember(groupId, requesterId);
    if (!isMember) {
      throw Exception.new({
        code: Code.UNAUTHORIZED_ERROR,
        overrideMessage: 'requester not member',
      });
    }

    const group = await this.groupRepository.findGroupById(groupId);
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
    const isMember = await this.groupRepository.isMember(groupId, requesterId);
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
  }): Promise<void> {
    const { requesterId, invitationCode } = payload;

    const group =
      await this.groupRepository.findGroupByInvitationCode(invitationCode);
    if (!group) {
      throw Exception.new({
        code: Code.ENTITY_NOT_FOUND_ERROR,
        overrideMessage: 'Group not found',
      });
    }

    const isMember = await this.groupRepository.isMember(group.id, requesterId);
    if (isMember) {
      throw Exception.new({
        code: Code.BAD_REQUEST_ERROR,
        overrideMessage: 'requester already member',
      });
    }

    const result = await this.groupRepository.addJoinRequestUsers(group.id, [
      requesterId,
    ]);
    if (!result) {
      throw Exception.new({
        code: Code.INTERNAL_ERROR,
      });
    }
  }

  async getJoinRequestUsers(payload: {
    requesterId: string;
    groupId: string;
  }): Promise<TGroupJoinRequestUser[]> {
    const { requesterId, groupId } = payload;
    const isOwner = await this.groupRepository.isOwner(groupId, requesterId);
    if (!isOwner) {
      throw Exception.new({
        code: Code.UNAUTHORIZED_ERROR,
        overrideMessage: 'requester not owner',
      });
    }

    const joinRequestUserList =
      await this.groupRepository.findJoinRequestUsers(groupId);
    return joinRequestUserList;
  }

  async approveJoinRequest(payload: {
    requesterId: string;
    groupId: string;
    memberId: string;
  }): Promise<void> {
    const { requesterId, groupId, memberId } = payload;

    const [isOwner, isJoinRequestUser] = await Promise.all([
      this.groupRepository.isOwner(groupId, requesterId),
      this.groupRepository.isJoinRequestUser(groupId, memberId),
    ]);
    if (!isOwner) {
      throw Exception.new({
        code: Code.UNAUTHORIZED_ERROR,
        overrideMessage: 'requester not owner',
      });
    }
    if (!isJoinRequestUser) {
      throw Exception.new({
        code: Code.BAD_REQUEST_ERROR,
        overrideMessage: 'the user is not requested join group',
      });
    }

    const result = await this.groupRepository.approveJoinRequestUser(
      groupId,
      memberId
    );
    if (!result) {
      throw Exception.new({
        code: Code.BAD_REQUEST_ERROR,
        overrideMessage: 'Failed to move join request to member',
      });
    }
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

    const result = await this.groupRepository.rejectJoinRequestUser(
      groupId,
      memberId
    );

    if (!result) {
      throw Exception.new({
        code: Code.BAD_REQUEST_ERROR,
      });
    }
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

    const result = await this.groupRepository.deleteMembers(groupId, [
      memberId,
    ]);
    if (!result) {
      throw Exception.new({
        code: Code.BAD_REQUEST_ERROR,
        overrideMessage: 'Failed to drop out member',
      });
    }
  }

  async leaveGroup(payload: {
    requesterId: string;
    groupId: string;
  }): Promise<void> {
    const { requesterId, groupId } = payload;

    const [isOwner, isMember] = await Promise.all([
      this.groupRepository.isOwner(groupId, requesterId),
      this.groupRepository.isMember(groupId, requesterId),
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

    const result = await this.groupRepository.deleteMembers(groupId, [
      requesterId,
    ]);
    if (!result) {
      throw Exception.new({
        code: Code.BAD_REQUEST_ERROR,
      });
    }
  }

  async getMemberList(payload: {
    requesterId: string;
    groupId: string;
    pagination: TGroupsPaginationParams;
  }): Promise<TGroupsPaginatedResult<TGroupMember>> {
    const { requesterId, groupId, pagination } = payload;
    const isMember = await this.groupRepository.isMember(groupId, requesterId);
    if (!isMember) {
      throw Exception.new({
        code: Code.UNAUTHORIZED_ERROR,
        overrideMessage: 'requester not member',
      });
    }

    const memberList = await this.groupRepository.findMembers(
      groupId,
      pagination
    );
    return memberList;
  }
}
