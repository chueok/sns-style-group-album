import { Code } from '../../common/exception/code';
import { Exception } from '../../common/exception/exception';
import { TGroup, TGroupMember } from './entity/group';
import {
  IGroupRepository,
  TPaginatedResult,
  TPaginationParams,
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

  async changeGroupOwner(groupId: string, ownerId: string): Promise<TGroup> {
    const isMember = await this.groupRepository.isMember(groupId, ownerId);
    if (!isMember) {
      throw Exception.new({
        code: Code.BAD_REQUEST_ERROR,
        overrideMessage: 'Owner not in group',
      });
    }

    const group = await this.groupRepository.updateGroup(groupId, { ownerId });
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

  async getGroupList(userId: string): Promise<TPaginatedResult<TGroup>> {
    const groupList = await this.groupRepository.findGroupsByUserId(userId);
    return groupList;
  }

  async getGroup(groupId: string): Promise<TGroup> {
    const group = await this.groupRepository.findGroupById(groupId);
    if (!group) {
      throw Exception.new({
        code: Code.ENTITY_NOT_FOUND_ERROR,
        overrideMessage: 'Group not found',
      });
    }
    return group;
  }

  async getOwnGroupList(userId: string): Promise<TPaginatedResult<TGroup>> {
    const ownGroupList = await this.groupRepository.findGroupsByOwnerId(userId);
    return ownGroupList;
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

  /****************************************************
   * 멤버 CRUD 및 초대 함수
   ****************************************************/
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

  async approveMember(payload: {
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
      });
    }

    const deleteResult = await this.groupRepository.deleteJoinRequestUsers(
      groupId,
      [memberId]
    );
    if (!deleteResult) {
      throw Exception.new({
        code: Code.BAD_REQUEST_ERROR,
      });
    }

    const result = await this.groupRepository.addMembers(groupId, [memberId]);
    if (!result) {
      throw Exception.new({
        code: Code.BAD_REQUEST_ERROR,
        overrideMessage: 'Failed to add member',
      });
    }
  }

  async getInvitationCode(payload: {
    requesterId: string;
    groupId: string;
  }): Promise<string> {
    const { requesterId, groupId } = payload;
    const isOwner = await this.groupRepository.isOwner(groupId, requesterId);
    if (!isOwner) {
      throw Exception.new({
        code: Code.UNAUTHORIZED_ERROR,
        overrideMessage: 'requester not owner',
      });
    }

    const invitationCode =
      await this.groupRepository.generateInvitationCode(groupId);
    return invitationCode;
  }

  async requestJoinGroup(payload: {
    requesterId: string;
    invitationCode: string;
  }): Promise<void> {
    const { requesterId, invitationCode } = payload;
    const result = await this.groupRepository.addJoinRequestUsers(
      invitationCode,
      [requesterId]
    );
    if (!result) {
      throw Exception.new({
        code: Code.INTERNAL_ERROR,
      });
    }
  }

  async getMemberList(payload: {
    requesterId: string;
    groupId: string;
    pagination?: TPaginationParams;
  }): Promise<TPaginatedResult<TGroupMember>> {
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
