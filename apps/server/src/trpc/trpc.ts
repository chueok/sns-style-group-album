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
