import z from 'zod';
import { authProcedure, router } from '../trpc';
import {
  SGroup,
  SGroupJoinRequestUser,
  SGroupsPaginationParams,
} from '@repo/be-core';

export const groupRouter = router({
  createGroup: authProcedure
    .input(z.object({ name: z.string() }))
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
    .mutation(async ({ input, ctx }) => {
      const { groupId, toBeOwnerId } = input;
      const {
        user,
        group: { groupService },
      } = ctx;
      const group = await groupService.changeGroupOwner({
        requesterId: user.id,
        groupId,
        toBeOwnerId,
      });
      return group;
    }),

  changeGroupName: authProcedure
    .input(z.object({ groupId: z.string(), name: z.string() }))
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
    .mutation(async ({ input, ctx }) => {
      const { invitationCode } = input;
      const {
        user,
        group: { groupService },
      } = ctx;
      await groupService.requestJoinGroup({
        requesterId: user.id,
        invitationCode,
      });
    }),

  getJoinRequestUsers: authProcedure
    .input(z.object({ groupId: z.string() }))
    .output(z.array(SGroupJoinRequestUser))
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
    .mutation(async ({ input, ctx }) => {
      const { groupId, memberId } = input;
      const {
        user,
        group: { groupService },
      } = ctx;
      await groupService.approveJoinRequest({
        requesterId: user.id,
        groupId,
        memberId,
      });
    }),

  rejectJoinRequest: authProcedure
    .input(z.object({ groupId: z.string(), memberId: z.string() }))
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

  getMemberList: authProcedure
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
      const memberList = await groupService.getMemberList({
        requesterId: user.id,
        groupId,
        pagination,
      });
      return memberList;
    }),

  leaveGroup: authProcedure
    .input(z.object({ groupId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const { groupId } = input;
      const {
        user,
        group: { groupService },
      } = ctx;
      await groupService.leaveGroup({ requesterId: user.id, groupId });
    }),
});
