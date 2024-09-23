import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
} from "@nestjs/common";
import { HttpRequestWithUser } from "../type/http-user";
import { IAuthService } from "../auth-service.interface";
import { DiTokens } from "../../../di/di-tokens";

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

    const groupId = (request as any)?.params?.groupId;

    if (!groupId || typeof groupId !== "string") {
      return false;
    }

    return this.authService.isUserInGroup(user.id, groupId);
  }
}
