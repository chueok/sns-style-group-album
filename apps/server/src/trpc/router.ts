import { authRouter } from './routers/auth-router';
import { userRouter } from './routers/user-router';
import { router } from './trpc';

export const appRouter = router({
  auth: authRouter,
  user: userRouter,
});

export type TrpcAppRouter = typeof appRouter;
