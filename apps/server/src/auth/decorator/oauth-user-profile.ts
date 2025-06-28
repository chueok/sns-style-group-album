import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { SOauthUserProfile } from '../type/oauth-user-profile';
import { Code, Exception } from '@repo/be-core';

export const DOauthUserProfile: () => any = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    // passport guard는 'user'를 키로 사용하고 있어, oauthUserProfile 정보를 user로 넘김
    // user는 너무 일반적인 키이므로, schema 검증 후 사용
    if ('user' in request) {
      const result = SOauthUserProfile.safeParse(request.user);
      if (!result.success) {
        throw Exception.new({ code: Code.BAD_REQUEST_ERROR });
      }

      return result.data;
    }

    throw Exception.new({ code: Code.BAD_REQUEST_ERROR });
  }
);
