import { z } from 'zod';
import { authProcedure, router } from '../trpc';
import { Code, Exception, SMemberPaginationParams } from '@repo/be-core';

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

  getMemberProfilesByPagination: authProcedure
    .input(
      SMemberPaginationParams.extend({
        groupId: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { user: jwtUser } = ctx;
      const { userService } = ctx.userDomain;

      const result = await userService.getMemberProfilesByPagination({
        requesterId: jwtUser.id,
        groupId: input.groupId,
        pagination: input,
      });

      return result;
    }),

  deleteUser: authProcedure.mutation(async ({ ctx }) => {
    const { user: jwtUser } = ctx;
    const { userService } = ctx.userDomain;

    await userService.deleteUser(jwtUser.id);

    return;
  }),

  editDefaultProfile: authProcedure
    .input(
      z.object({
        username: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { user: jwtUser } = ctx;
      const { userService } = ctx.userDomain;
      const { username } = input;

      await userService.editDefaultProfile({
        userId: jwtUser.id,
        username,
      });

      return;
    }),

  generateProfileImageUploadUrl: authProcedure
    .output(
      z.object({
        url: z.string(),
      })
    )
    .mutation(async ({ ctx }) => {
      const { user: jwtUser } = ctx;
      const { userService } = ctx.userDomain;

      const url = await userService.generateProfileImageUploadUrl({
        requesterId: jwtUser.id,
      });

      return { url };
    }),

  deleteProfileImage: authProcedure.mutation(async ({ ctx }) => {
    const { user: jwtUser } = ctx;
    const { userService } = ctx.userDomain;

    await userService.deleteProfileImage({ requesterId: jwtUser.id });

    return;
  }),
});
