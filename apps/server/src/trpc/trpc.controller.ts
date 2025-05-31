import { Controller, Get, Post, Req, Res } from '@nestjs/common';
import { createExpressMiddleware } from '@trpc/server/adapters/express';
import { Request, Response } from 'express';
import { appRouter } from './router';
import { CreateExpressContextOptions } from '@trpc/server/adapters/express';
import { AuthService } from '../auth/auth-service';
import {
  createAuthInnerContext,
  createUserInnerContext,
} from './inner-context';
import { UserService } from '@repo/be-core';

@Controller('trpc')
export class TrpcController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService
  ) {}

  private createContext = ({ req, res }: CreateExpressContextOptions) => {
    return {
      req,
      res,
      auth: createAuthInnerContext({ authService: this.authService }),
      userDomain: createUserInnerContext({ userService: this.userService }),
    };
  };

  private trpcMiddleware = createExpressMiddleware({
    router: appRouter,
    createContext: this.createContext,
  });

  @Get('*')
  async handleGet(@Req() req: Request, @Res() res: Response) {
    const result = this.trpcMiddleware(req, res, () => {});
    return result;
  }

  @Post('*')
  async handlePost(@Req() req: Request, @Res() res: Response) {
    const result = this.trpcMiddleware(req, res, () => {});
    return result;
  }
}
