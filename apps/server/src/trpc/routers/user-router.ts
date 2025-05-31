import { z } from 'zod';
import { authProcedure, router } from '../trpc';

export const userRouter = router({
  getUser: authProcedure.query(async ({ ctx }) => {
    const { user: jwtUser } = ctx;
    const { userService } = ctx.userDomain;

    const user = await userService.getUser(jwtUser.id);

    return { user };
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
        username: z.string(),
        profileImageUrl: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { user: jwtUser } = ctx;
      const { userService } = ctx.userDomain;

      await userService.editDefaultProfile({ userId: jwtUser.id, ...input });

      return { success: true };
    }),
});
