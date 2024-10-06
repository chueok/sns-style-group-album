import { CanActivate, ExecutionContext, Inject } from "@nestjs/common";
import { Observable } from "rxjs";
import { DiTokens } from "../../../di/di-tokens";
import { IAuthService } from "../auth-service.interface";
import { ExtractJwt } from "passport-jwt";
import { Reflector } from "@nestjs/core";
import { Permission, PermissionEnum } from "../decorator/permission";
import { JwtService } from "@nestjs/jwt";
import { JwtUserModel, JwtUserPayload } from "../type/jwt-user-payload";
import { plainToInstance } from "class-transformer";
import { validateSync } from "class-validator";
import { HttpRequestWithUser } from "../type/verified-user-payload";

/**
 * user 권한 확인.
 * permission decorator 를 통해 설정된 권한을 확인한다.
 * 설정된 권한이 없으면 USER 권한으로 설정된다.
 */
export class HttpPermissionGuard implements CanActivate {
  constructor(
    @Inject(DiTokens.AuthService) private readonly authService: IAuthService,
    private reflector: Reflector,
    private readonly jwtService: JwtService,
  ) {}
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request: Request = context.switchToHttp().getRequest();
    const permision =
      this.reflector.get(Permission, context.getHandler()) ||
      PermissionEnum.USER;

    const jwt = ExtractJwt.fromAuthHeaderAsBearerToken()(request);
    if (!jwt) {
      return false;
    }

    let jwtUserModel: JwtUserModel;
    try {
      const jwtPayload: JwtUserPayload = this.jwtService.verify(jwt);
      jwtUserModel = plainToInstance(JwtUserModel, jwtPayload);
      const errors = validateSync(jwtUserModel);
      if (errors.length > 0) {
        return false;
      }
    } catch (error) {
      return false;
    }

    const promiseList: Promise<boolean>[] = [];

    promiseList.push(
      this.authService.getUser({ id: jwtUserModel.id }).then((user) => {
        if (!user) {
          return false;
        }
        (request as HttpRequestWithUser).user = user;
        return true;
      }),
    );

    if (permision === PermissionEnum.GROUP_OWNER) {
      const groupId = (request as any)?.params?.groupId;
      if (!groupId || typeof groupId !== "string") {
        return false;
      }

      promiseList.push(this.authService.isGroupOwner(jwtUserModel.id, groupId));
    } else if (
      permision === PermissionEnum.GROUP_MEMBER ||
      permision === PermissionEnum.CONTENT_OWNER
    ) {
      const groupId = (request as any)?.params?.groupId;
      if (!groupId || typeof groupId !== "string") {
        return false;
      }

      promiseList.push(
        this.authService.isUserInGroup(jwtUserModel.id, groupId),
      );
    }

    if (permision === PermissionEnum.CONTENT_OWNER) {
      const contentId = (request as any)?.params?.contentId;
      if (!contentId || typeof contentId !== "string") {
        return false;
      }

      promiseList.push(
        this.authService.isContentOwner(jwtUserModel.id, contentId),
      );
    }

    return Promise.all(promiseList).then((results) => {
      return results.every((result) => result);
    });
  }
}
