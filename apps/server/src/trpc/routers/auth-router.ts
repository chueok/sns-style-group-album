import { router, publicProcedure } from '../trpc';

export const authRouter = router({
  logout: publicProcedure.mutation(async ({ ctx }) => {
    await ctx.auth.authService.logout({
      req: ctx.req,
      res: ctx.res,
    });
    return;
  }),
});
