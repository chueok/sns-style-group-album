import { CanActivate, ExecutionContext, Inject } from "@nestjs/common";
import { DiTokens } from "../../../di/di-tokens";
import { IAuthService } from "../auth-service.interface";
import { ExtractJwt } from "passport-jwt";
import { Reflector } from "@nestjs/core";
import { Permission, PermissionEnum } from "../decorator/permission";
import {
  HttpRequestWithUser,
  VerifiedUserPayload,
} from "../type/verified-user-payload";
import { Code, Exception } from "@repo/be-core";

/**
 * user 권한 확인.
 * permission decorator 를 통해 설정된 권한을 확인한다.
 * 설정된 권한이 없으면 USER 권한으로 설정된다.
 */
// TODO : 다시 각 permission 별로 가드를 만드는게 좋을 것으로 보임
export class HttpPermissionGuard implements CanActivate {
  constructor(
    @Inject(DiTokens.AuthService) private readonly authService: IAuthService,
    private reflector: Reflector,
  ) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: Request = context.switchToHttp().getRequest();
    const permision =
      this.reflector.get(Permission, context.getHandler()) ||
      PermissionEnum.USER;

    const jwt = ExtractJwt.fromAuthHeaderAsBearerToken()(request);
    if (!jwt) {
      throw Exception.new({
        code: Code.UNAUTHORIZED_ERROR,
      });
    }
    const jwtUserModel = this.authService.validateLoginToken(jwt);

    let user: VerifiedUserPayload;
    let groupId: string;
    let contentId: string;
    let commentId: string;
    switch (permision) {
      case PermissionEnum.USER:
        user = await this.authService.getUser({ id: jwtUserModel.id });
        break;

      case PermissionEnum.GROUP_OWNER:
        groupId = (request as any)?.params?.groupId;
        if (!groupId || typeof groupId !== "string") {
          throw Exception.new({
            code: Code.BAD_REQUEST_ERROR,
          });
        }
        user = await this.authService.getGroupOwner({
          userId: jwtUserModel.id,
          groupId,
        });
        break;

      case PermissionEnum.GROUP_MEMBER:
        groupId = (request as any)?.params?.groupId;
        if (!groupId || typeof groupId !== "string") {
          throw Exception.new({
            code: Code.BAD_REQUEST_ERROR,
          });
        }
        user = await this.authService.getGroupMember({
          userId: jwtUserModel.id,
          groupId,
        });
        break;

      case PermissionEnum.CONTENT_OWNER:
        groupId = (request as any)?.params?.groupId;
        contentId = (request as any)?.params?.contentId;
        if (
          !groupId ||
          typeof groupId !== "string" ||
          !contentId ||
          typeof contentId !== "string"
        ) {
          throw Exception.new({
            code: Code.BAD_REQUEST_ERROR,
          });
        }
        user = await this.authService.getContentOwner({
          userId: jwtUserModel.id,
          groupId,
          contentId,
        });
        break;
      case PermissionEnum.COMMENT_OWNER:
        groupId = (request as any)?.params?.groupId;
        commentId = (request as any)?.params?.commentId;
        if (
          !groupId ||
          typeof groupId !== "string" ||
          !commentId ||
          typeof commentId !== "string"
        ) {
          throw Exception.new({
            code: Code.BAD_REQUEST_ERROR,
          });
        }
        user = await this.authService.getCommentOwner({
          userId: jwtUserModel.id,
          groupId,
          commentId,
        });
        break;
      default:
        throw Exception.new({
          code: Code.BAD_REQUEST_ERROR,
        });
    }

    (request as HttpRequestWithUser).user = user;
    return true;
  }
}
