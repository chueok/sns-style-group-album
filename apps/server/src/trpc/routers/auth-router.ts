import { router, authProcedure } from '../trpc';

export const authRouter = router({
  getMe: authProcedure.query(async ({ ctx }) => {
    const { user } = ctx;

    return { user };
  }),
});
