import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { HttpRequestWithUser } from "../type/http-user";
import { HttpAuthService } from "../http-auth-service";

@Injectable()
export class HttpGroupMemberGuard implements CanActivate {
  constructor(private readonly authService: HttpAuthService) {}

  public async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: HttpRequestWithUser = context.switchToHttp().getRequest();
    const user = request.user;
    if (!user) {
      return false;
    }
    const groupId = (request as any)?.params?.groupId;
    if (!groupId || typeof groupId !== "string") {
      return false;
    }

    return this.authService.isUserInGroup(user.id, groupId);
  }
}
