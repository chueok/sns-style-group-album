import { z } from 'zod';
import { authProcedure, router } from '../trpc';
import { Code, Exception } from '@repo/be-core';

export const userRouter = router({
  getMe: authProcedure.query(async ({ ctx }) => {
    const { user: jwtUser } = ctx;
    const { userService } = ctx.userDomain;

    const user = await userService.getUser(jwtUser.id);

    return user;
  }),

  getMemberProfiles: authProcedure
    .input(
      z.object({
        userIds: z.array(z.string()),
        groupId: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { user: jwtUser } = ctx;
      const { userService } = ctx.userDomain;

      const users = await userService.getMemberProfiles({
        requesterId: jwtUser.id,
        userIds: input.userIds,
        groupId: input.groupId,
      });

      return users;
    }),

  getMemberProfile: authProcedure
    .input(
      z.object({
        userId: z.string(),
        groupId: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { user: jwtUser } = ctx;
      const { userService } = ctx.userDomain;

      const users = await userService.getMemberProfiles({
        requesterId: jwtUser.id,
        userIds: [input.userId],
        groupId: input.groupId,
      });

      const user = users.at(0);
      if (!user) {
        throw Exception.new({
          code: Code.ENTITY_NOT_FOUND_ERROR,
          overrideMessage: 'User not found',
        });
      }

      return user;
    }),

  deleteUser: authProcedure.mutation(async ({ ctx }) => {
    const { user: jwtUser } = ctx;
    const { userService } = ctx.userDomain;

    await userService.deleteUser(jwtUser.id);

    return { success: true };
  }),

  editGroupProfile: authProcedure
    .input(
      z.object({
        groupId: z.string(),
        username: z.string().optional(),
        profileImageUrl: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { user: jwtUser } = ctx;
      const { userService } = ctx.userDomain;

      await userService.editGroupProfile({ userId: jwtUser.id, ...input });

      return { success: true };
    }),

  editDefaultProfile: authProcedure
    .input(
      z.object({
        username: z.string().optional(),
        profileImageUrl: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { user: jwtUser } = ctx;
      const { userService } = ctx.userDomain;

      await userService.editDefaultProfile({ userId: jwtUser.id, ...input });

      return { success: true };
    }),
});
