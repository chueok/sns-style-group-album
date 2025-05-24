import { router, authProcedure, publicProcedure } from '../trpc';

export const authRouter = router({
  getMe: authProcedure.query(async ({ ctx }) => {
    const { user } = ctx;

    return { user };
  }),

  logout: publicProcedure.mutation(async ({ ctx }) => {
    await ctx.auth.authService.logout({
      req: ctx.req,
      res: ctx.res,
    });
    return;
  }),
});
