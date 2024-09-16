import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { HttpRequestWithUser } from "../type/http-user";

export const HttpUser: () => any = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request: HttpRequestWithUser = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
