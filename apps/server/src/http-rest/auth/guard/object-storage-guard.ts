import { CanActivate, ExecutionContext } from "@nestjs/common";
import { ExtractJwt } from "passport-jwt";
import { ServerConfig } from "../../../config/server-config";

export class HttpObjectStorageGuard implements CanActivate {
  public async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: Request = context.switchToHttp().getRequest();
    const token = ExtractJwt.fromAuthHeaderAsBearerToken()(request);

    if (!token) {
      return false;
    }

    if (token !== ServerConfig.OBJECT_STORAGE_WEB_HOOK_AUTH) {
      return false;
    }

    return true;
  }
}
