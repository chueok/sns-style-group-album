import { Controller, Get, Inject, Post, Req, Res } from '@nestjs/common';
import { createExpressMiddleware } from '@trpc/server/adapters/express';
import { Request, Response } from 'express';
import { appRouter } from './router';
import { CreateExpressContextOptions } from '@trpc/server/adapters/express';
import { AuthService } from '../auth/auth-service';
import {
  createAuthInnerContext,
  createGroupInnerContext,
  createSeedInnerContext,
  createUserInnerContext,
} from './inner-context';
import {
  GroupService,
  IGroupRepository,
  IUserRepository,
  UserService,
} from '@repo/be-core';
import { DataSource } from 'typeorm';
import { ServerConfig } from '../config/server-config';
import { IAuthRepository } from '../auth/auth-repository.interface';
import { DiTokens as AuthDiTokens } from '../auth/di-tokens';
import { DiTokens as UserDiTokens } from '../user/di-tokens';
import { DiTokens as GroupDiTokens } from '../group/di-tokens';

@Controller('trpc')
export class TrpcController {
  constructor(
    @Inject(AuthDiTokens.AuthRepository)
    private readonly authRepository: IAuthRepository,
    private readonly authService: AuthService,

    @Inject(UserDiTokens.UserRepository)
    private readonly userRepository: IUserRepository,
    private readonly userService: UserService,

    @Inject(GroupDiTokens.GroupRepository)
    private readonly groupRepository: IGroupRepository,
    private readonly groupService: GroupService,

    private readonly dataSource: DataSource
  ) {}

  private createContext = ({ req, res }: CreateExpressContextOptions) => {
    return {
      req,
      res,
      auth: createAuthInnerContext({
        authService: this.authService,
        authRepository: this.authRepository,
      }),
      userDomain: createUserInnerContext({
        userService: this.userService,
        userRepository: this.userRepository,
      }),
      group: createGroupInnerContext({
        groupService: this.groupService,
        groupRepository: this.groupRepository,
      }),
      ...(ServerConfig.NODE_ENV !== 'production'
        ? { seed: createSeedInnerContext({ dataSource: this.dataSource }) }
        : {}),
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
