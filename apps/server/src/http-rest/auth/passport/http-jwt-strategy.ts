import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { HttpAuthService } from "../http-auth-service";
import { ServerConfig } from "../../../config/server-config";
import { Optional } from "@repo/be-core";
import { HttpUserPayload } from "../type/http-user";
import { HttpJwtUserPayload } from "../type/http-jwt";
import { AuthProviderEnum } from "../auth-provider-enum";

@Injectable()
export class HttpJwtStrategy extends PassportStrategy(
  Strategy,
  AuthProviderEnum.JWT,
) {
  constructor(private authService: HttpAuthService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: ServerConfig.JWT_SECRET,
    });
  }

  public async validate(
    payload: HttpJwtUserPayload,
  ): Promise<Optional<HttpUserPayload>> {
    const user = await this.authService.getUser({ id: payload.id });
    if (!user) {
      return undefined;
    }

    return user;
  }
}
