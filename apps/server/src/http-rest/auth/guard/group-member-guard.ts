import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
} from "@nestjs/common";
import { HttpRequestWithUser } from "../type/http-user";
import { IAuthService } from "../auth-service.interface";
import { DiTokens } from "../../../di/di-tokens";
import { Code, CustomAssert, Exception } from "@repo/be-core";

@Injectable()
export class HttpGroupMemberGuard implements CanActivate {
  constructor(
    @Inject(DiTokens.AuthService) private readonly authService: IAuthService,
  ) {}

  public async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: HttpRequestWithUser = context.switchToHttp().getRequest();
    const user = request.user;
    if (!user) {
      return false;
    }

    CustomAssert.isFalse(
      (request as any)?.params?.groupId && (request as any)?.query?.groupId,
      Exception.new({
        code: Code.INTERNAL_ERROR,
        overrideMessage: "api design error",
      }),
    );
    const groupId =
      (request as any)?.params?.groupId || (request as any)?.query?.groupId;

    if (!groupId || typeof groupId !== "string") {
      return false;
    }

    return this.authService.isUserInGroup(user.id, groupId);
  }
}
