import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { AuthModuleConfig } from '../config';
import { Code } from '@repo/be-core';
import { Exception } from '@repo/be-core';

export const DJwtUser: () => any = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();

    // jwt-user-guard 에서 schema 검증하였으므로 추가 검증 불필요
    if (AuthModuleConfig.JwtUserKeyInRequest in request) {
      return request[AuthModuleConfig.JwtUserKeyInRequest];
    }
    throw Exception.new({
      code: Code.UNAUTHORIZED_ERROR,
      overrideMessage: 'No jwt user found',
    });
  }
);
