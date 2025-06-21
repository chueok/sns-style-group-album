import z from 'zod';
import { authProcedure, router } from '../trpc';
import {
  Code,
  Exception,
  SGroup,
  SPendingMember,
  SGroupsPaginationParams,
  SAcceptedMember,
} from '@repo/be-core';

export const groupRouter = router({
  createGroup: authProcedure
    .input(z.object({ name: z.string() }))
    .output(SGroup)
    .mutation(async ({ input, ctx }) => {
      const { name } = input;
      const {
        user,
        group: { groupService },
      } = ctx;
      const group = await groupService.createGroup(user.id, name);
      return group;
    }),

  changeGroupOwner: authProcedure
    .input(z.object({ groupId: z.string(), toBeOwnerId: z.string() }))
    .output(z.void())
    .mutation(async ({ input, ctx }) => {
      const { groupId, toBeOwnerId } = input;
      const {
        user,
        group: { groupService },
      } = ctx;
      await groupService.changeGroupOwner({
        requesterId: user.id,
        groupId,
        toBeOwnerId,
      });
    }),

  changeGroupName: authProcedure
    .input(z.object({ groupId: z.string(), name: z.string() }))
    .output(SGroup)
    .mutation(async ({ input, ctx }) => {
      const { groupId, name } = input;
      const {
        user,
        group: { groupService },
      } = ctx;
      const group = await groupService.changeGroupName({
        requesterId: user.id,
        groupId,
        name,
      });
      return group;
    }),

  deleteGroup: authProcedure
    .input(z.object({ groupId: z.string() }))
    .output(z.void())
    .mutation(async ({ input, ctx }) => {
      const { groupId } = input;
      const {
        user,
        group: { groupService },
      } = ctx;
      await groupService.deleteGroup({
        requesterId: user.id,
        groupId,
      });
    }),

  getMyMemberGroups: authProcedure
    .input(SGroupsPaginationParams)
    .query(async ({ input, ctx }) => {
      const {
        user,
        group: { groupService },
      } = ctx;
      const groupList = await groupService.getMyMemberGroups({
        requesterId: user.id,
        pagination: input,
      });
      return groupList;
    }),

  getMyOwnGroups: authProcedure
    .input(SGroupsPaginationParams)
    .query(async ({ input, ctx }) => {
      const {
        user,
        group: { groupService },
      } = ctx;
      const groupList = await groupService.getMyOwnGroups({
        requesterId: user.id,
        pagination: input,
      });
      return groupList;
    }),

  getGroup: authProcedure
    .input(z.object({ groupId: z.string() }))
    .output(SGroup)
    .query(async ({ input, ctx }) => {
      const { groupId } = input;
      const {
        user,
        group: { groupService },
      } = ctx;
      const group = await groupService.getGroup({
        requesterId: user.id,
        groupId,
      });
      return group;
    }),

  getInvitationCode: authProcedure
    .input(z.object({ groupId: z.string() }))
    .query(async ({ input, ctx }) => {
      const { groupId } = input;
      const {
        user,
        group: { groupService },
      } = ctx;
      const invitationCode = await groupService.getInvitationCode({
        requesterId: user.id,
        groupId,
      });
      return invitationCode;
    }),

  requestJoinGroup: authProcedure
    .input(z.object({ invitationCode: z.string() }))
    .output(SPendingMember)
    .mutation(async ({ input, ctx }) => {
      const { invitationCode } = input;
      const {
        user,
        group: { groupService },
      } = ctx;
      const pendingMember = await groupService.requestJoinGroup({
        requesterId: user.id,
        invitationCode,
      });
      return pendingMember;
    }),

  getJoinRequestUsers: authProcedure
    .input(z.object({ groupId: z.string() }))
    .output(z.array(SPendingMember))
    .query(async ({ input, ctx }) => {
      const { groupId } = input;
      const {
        user,
        group: { groupService },
      } = ctx;
      const joinRequestUserList = await groupService.getJoinRequestUsers({
        requesterId: user.id,
        groupId,
      });

      return joinRequestUserList;
    }),

  approveJoinRequest: authProcedure
    .input(z.object({ groupId: z.string(), memberId: z.string() }))
    .output(SAcceptedMember)
    .mutation(async ({ input, ctx }) => {
      const { groupId, memberId } = input;
      const {
        user,
        group: { groupService },
      } = ctx;
      const acceptedMember = await groupService.approveJoinRequest({
        requesterId: user.id,
        groupId,
        memberId,
      });
      return acceptedMember;
    }),

  rejectJoinRequest: authProcedure
    .input(z.object({ groupId: z.string(), memberId: z.string() }))
    .output(z.void())
    .mutation(async ({ input, ctx }) => {
      const { groupId, memberId } = input;
      const {
        user,
        group: { groupService },
      } = ctx;
      await groupService.rejectJoinRequest({
        requesterId: user.id,
        groupId,
        memberId,
      });
    }),

  dropOutMember: authProcedure
    .input(z.object({ groupId: z.string(), memberId: z.string() }))
    .output(z.void())
    .mutation(async ({ input, ctx }) => {
      const { groupId, memberId } = input;
      const {
        user,
        group: { groupService },
      } = ctx;
      await groupService.dropOutMember({
        requesterId: user.id,
        groupId,
        memberId,
      });
    }),

  getMembersByGroupId: authProcedure
    .input(
      SGroupsPaginationParams.extend({
        groupId: z.string(),
      })
    )
    .query(async ({ input, ctx }) => {
      const { groupId, ...pagination } = input;
      const {
        user,
        group: { groupService },
      } = ctx;
      const memberList = await groupService.getMembersByGroupId({
        requesterId: user.id,
        groupId,
        pagination,
      });
      return memberList;
    }),

  getMemberById: authProcedure
    .input(z.object({ groupId: z.string(), memberId: z.string() }))
    .output(SAcceptedMember)
    .query(async ({ input, ctx }) => {
      const { groupId, memberId } = input;
      const {
        user,
        group: { groupService },
      } = ctx;
      const members = await groupService.getMembersByMemberIds({
        requesterId: user.id,
        groupId,
        memberIds: [memberId],
      });
      const member = members.at(0);

      if (!member) {
        throw Exception.new({
          code: Code.ENTITY_NOT_FOUND_ERROR,
          overrideMessage: 'Member not found',
        });
      }

      return member;
    }),

  getMembersByIds: authProcedure
    .input(z.object({ groupId: z.string(), memberIds: z.array(z.string()) }))
    .output(z.array(SAcceptedMember))
    .query(async ({ input, ctx }) => {
      const { groupId, memberIds: memberIds } = input;
      const {
        user,
        group: { groupService },
      } = ctx;
      const members = await groupService.getMembersByMemberIds({
        requesterId: user.id,
        groupId,
        memberIds,
      });
      return members;
    }),

  getMyMemberInfo: authProcedure
    .input(z.object({ groupId: z.string() }))
    .output(SAcceptedMember)
    .query(async ({ input, ctx }) => {
      const { groupId } = input;
      const {
        user,
        group: { groupService },
      } = ctx;
      const member = await groupService.getMyMemberInfo({
        requesterId: user.id,
        groupId,
      });
      return member;
    }),

  leaveGroup: authProcedure
    .input(z.object({ groupId: z.string() }))
    .output(z.void())
    .mutation(async ({ input, ctx }) => {
      const { groupId } = input;
      const {
        user,
        group: { groupService },
      } = ctx;
      await groupService.leaveGroup({ requesterId: user.id, groupId });
    }),
});
