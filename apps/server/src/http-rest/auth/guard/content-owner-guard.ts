import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
} from "@nestjs/common";
import { HttpRequestWithUser } from "../type/verified-user-payload";
import { DiTokens } from "../../../di/di-tokens";
import { IAuthService } from "../auth-service.interface";

@Injectable()
export class HttpContentOwnerGuard implements CanActivate {
  constructor(
    @Inject(DiTokens.AuthService) private readonly authService: IAuthService,
  ) {}

  public async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: HttpRequestWithUser = context.switchToHttp().getRequest();
    const user = request.user;
    if (!user) {
      return false;
    }
    const contentId = (request as any)?.params?.contentId;
    if (!contentId || typeof contentId !== "string") {
      return false;
    }

    return this.authService.isContentOwner(user.id, contentId);
  }
}
