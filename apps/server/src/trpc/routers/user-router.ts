import { z } from 'zod';
import { authProcedure, router } from '../trpc';

export const userRouter = router({
  getMe: authProcedure.query(async ({ ctx }) => {
    const { user: jwtUser } = ctx;
    const { userService } = ctx.userDomain;

    const user = await userService.getUser(jwtUser.id);

    return user;
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
