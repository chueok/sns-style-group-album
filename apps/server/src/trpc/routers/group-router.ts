import z from 'zod';
import { authProcedure, router } from '../trpc';
import {
  SGroup,
  SPendingMemberDTO,
  SGroupPaginationParams,
  SAcceptedMemberDTO,
  SGroupPaginatedResult,
  SMemberDtoPaginatedResult,
  SMemberDTO,
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
    .input(SGroupPaginationParams)
    .output(SGroupPaginatedResult)
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
    .input(SGroupPaginationParams)
    .output(SGroupPaginatedResult)
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
    .output(z.string())
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
    .output(SPendingMemberDTO)
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
    .output(z.array(SPendingMemberDTO))
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

  // input의 groupId는 client side cache를 위해 사용
  approveJoinRequest: authProcedure
    .input(z.object({ groupId: z.string(), memberId: z.string() }))
    .output(SAcceptedMemberDTO)
    .mutation(async ({ input, ctx }) => {
      const { groupId: _, memberId } = input;
      const {
        user,
        group: { groupService },
      } = ctx;
      const acceptedMember = await groupService.approveJoinRequest({
        requesterId: user.id,
        memberId,
      });
      return acceptedMember;
    }),

  // input의 groupId는 client side cache를 위해 사용
  rejectJoinRequest: authProcedure
    .input(z.object({ groupId: z.string(), memberId: z.string() }))
    .output(z.void())
    .mutation(async ({ input, ctx }) => {
      const { groupId: _, memberId } = input;
      const {
        user,
        group: { groupService },
      } = ctx;
      await groupService.rejectJoinRequest({
        requesterId: user.id,
        memberId,
      });
    }),

  // input의 groupId는 client side cache를 위해 사용
  dropOutMember: authProcedure
    .input(z.object({ groupId: z.string(), memberId: z.string() }))
    .output(z.void())
    .mutation(async ({ input, ctx }) => {
      const { groupId: _, memberId } = input;
      const {
        user,
        group: { groupService },
      } = ctx;
      await groupService.dropOutMember({
        requesterId: user.id,
        memberId,
      });
    }),

  getMembersByGroupId: authProcedure
    .input(
      SGroupPaginationParams.extend({
        groupId: z.string(),
      })
    )
    .output(SMemberDtoPaginatedResult)
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

  // groupId는 client side cache를 위해 사용
  getMemberById: authProcedure
    .input(z.object({ groupId: z.string(), memberId: z.string() }))
    .output(SMemberDTO)
    .query(async ({ input, ctx }) => {
      const { groupId: _, memberId } = input;
      const {
        user,
        group: { groupService },
      } = ctx;

      const member = await groupService.getMemberById({
        requesterId: user.id,
        memberId,
      });

      return member;
    }),

  getMyMemberInfo: authProcedure
    .input(z.object({ groupId: z.string() }))
    .output(SAcceptedMemberDTO)
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
