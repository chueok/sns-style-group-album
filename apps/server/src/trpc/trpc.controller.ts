import { Controller, Get, Inject, Post, Req, Res } from '@nestjs/common';
import { createExpressMiddleware } from '@trpc/server/adapters/express';
import { Request, Response } from 'express';
import { appRouter } from './router';
import { CreateExpressContextOptions } from '@trpc/server/adapters/express';
import { AuthService } from '../auth/auth-service';
import {
  createAuthInnerContext,
  createCommentInnerContext,
  createContentInnerContext,
  createGroupInnerContext,
  createSeedInnerContext,
  createUserInnerContext,
} from './inner-context';
import {
  ContentService,
  CommentService,
  GroupService,
  ICommentRepository,
  IContentRepository,
  IGroupRepository,
  IObjectStoragePort,
  IUserRepository,
  UserService,
} from '@repo/be-core';
import { DataSource } from 'typeorm';
import { ServerConfig } from '../config/server-config';
import { IAuthRepository } from '../auth/auth-repository.interface';
import { DiTokens as AuthDiTokens } from '../auth/di-tokens';
import { DiTokens as UserDiTokens } from '../user/di-tokens';
import { DiTokens as GroupDiTokens } from '../group/di-tokens';
import { DiTokens as ContentDiTokens } from '../content/di-tokens';
import { DiTokens as CommentDiTokens } from '../comment/di-tokens';
import { DiTokens } from '../di/di-tokens';

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

    @Inject(ContentDiTokens.ContentRepository)
    private readonly contentRepository: IContentRepository,
    private readonly contentService: ContentService,

    @Inject(CommentDiTokens.CommentRepository)
    private readonly commentRepository: ICommentRepository,
    private readonly commentService: CommentService,

    private readonly dataSource: DataSource,

    @Inject(DiTokens.ObjectStorage)
    private readonly objectStorage: IObjectStoragePort
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
      content: createContentInnerContext({
        contentService: this.contentService,
        contentRepository: this.contentRepository,
      }),
      comment: createCommentInnerContext({
        commentService: this.commentService,
        commentRepository: this.commentRepository,
      }),
      ...(ServerConfig.NODE_ENV !== 'production'
        ? {
            seed: createSeedInnerContext({
              dataSource: this.dataSource,
              objectStorage: this.objectStorage,
            }),
          }
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
