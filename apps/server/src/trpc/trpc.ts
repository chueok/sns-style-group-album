import { initTRPC } from '@trpc/server';
import { ZodError } from 'zod';
import { Request, Response } from 'express';
import { createAuthInnerContext } from './inner-context';

type Context = {
  req: Request;
  res: Response;
  auth: ReturnType<typeof createAuthInnerContext>;
};

const t = initTRPC.context<Context>().create({
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError:
          error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    };
  },
});

export const router = t.router;
export const publicProcedure = t.procedure;
export const authProcedure = t.procedure.use(async ({ ctx, next }) => {
  const { user } = await ctx.auth.authService.getMe({
    req: ctx.req,
    res: ctx.res,
  });

  return next({ ctx: { ...ctx, user } });
});
