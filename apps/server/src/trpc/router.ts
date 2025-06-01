import { ServerConfig } from '../config/server-config';
import { authRouter } from './routers/auth-router';
import { groupRouter } from './routers/group-router';
import { seedRouter } from './routers/seed-router';
import { userRouter } from './routers/user-router';
import { router } from './trpc';

export const appRouter = router({
  auth: authRouter,
  user: userRouter,
  group: groupRouter,
  ...(ServerConfig.NODE_ENV !== 'production' ? { seed: seedRouter } : {}),
});

export type TrpcAppRouter = typeof appRouter;
