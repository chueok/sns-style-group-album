import { Controller, Get, Post, Req, Res } from '@nestjs/common';
import { createExpressMiddleware } from '@trpc/server/adapters/express';
import { Request, Response } from 'express';
import { appRouter } from './router';
import { CreateExpressContextOptions } from '@trpc/server/adapters/express';
import { AuthService } from '../auth/auth-service';
import { createAuthInnerContext } from './inner-context';

@Controller('trpc')
export class TrpcController {
  constructor(private readonly authService: AuthService) {}

  private createContext = ({ req, res }: CreateExpressContextOptions) => {
    return {
      req,
      res,
      auth: createAuthInnerContext({ authService: this.authService }),
    };
  };

  private trpcMiddleware = createExpressMiddleware({
    router: appRouter,
    createContext: this.createContext,
  });

  @Get('*')
  @Post('*')
  async handle(@Req() req: Request, @Res() res: Response) {
    return this.trpcMiddleware(req, res, () => {});
  }
}
