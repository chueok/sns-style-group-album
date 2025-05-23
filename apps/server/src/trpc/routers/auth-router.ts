import { router, publicProcedure } from '../trpc';

export const authRouter = router({
  getMe: publicProcedure.query(async ({ ctx }) => {
    const {
      req,
      res,
      auth: { authService },
    } = ctx;

    const { user } = await authService.getMe({
      req,
      res,
    });

    return { user };
  }),
});
