import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { HttpRequestWithUser } from '../type/verified-user-payload';

export const VerifiedUser: () => any = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request: HttpRequestWithUser = ctx.switchToHttp().getRequest();
    return request.user;
  }
);
