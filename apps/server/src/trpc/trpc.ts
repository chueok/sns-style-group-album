import { initTRPC } from '@trpc/server';
import { ZodError } from 'zod';
import { Request, Response } from 'express';
import {
  createAuthInnerContext,
  createCommentInnerContext,
  createContentInnerContext,
  createGroupInnerContext,
  createSeedInnerContext,
  createUserInnerContext,
} from './inner-context';
import { Code, Exception } from '@repo/be-core';

type Context = {
  req: Request;
  res: Response;
  auth: ReturnType<typeof createAuthInnerContext>;
  userDomain: ReturnType<typeof createUserInnerContext>; // user 는 범용적으로 사용되는 단어로, 오해를 막기 위해 userDomain으로 하였음.
  group: ReturnType<typeof createGroupInnerContext>;
  content: ReturnType<typeof createContentInnerContext>;
  comment: ReturnType<typeof createCommentInnerContext>;

  seed?: ReturnType<typeof createSeedInnerContext>;
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
  try {
    const { user } = await ctx.auth.authService.getMe({
      req: ctx.req,
      res: ctx.res,
    });

    return next({ ctx: { ...ctx, user } });
  } catch (error) {
    if (
      error instanceof Exception &&
      error.code === Code.UNAUTHORIZED_ERROR.code
    ) {
      throw error;
    }
    throw Exception.new({
      code: Code.INTERNAL_ERROR,
      overrideMessage: 'Authentication failed',
    });
  }
});
