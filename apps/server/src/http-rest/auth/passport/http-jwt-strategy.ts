import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { HttpAuthService } from "../http-auth-service";
import { ServerConfig } from "../../../config/server-config";
import { Optional } from "@repo/be-core";
import { HttpUserPayload } from "../type/http-user";
import { HttpJwtPayload } from "../type/http-jwt";

@Injectable()
export class HttpJwtStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: HttpAuthService) {
    super({
      jwtFromRequest: ExtractJwt.fromHeader(ServerConfig.JWT_SECRET),
      ignoreExpiration: false,
      secretOrKey: ServerConfig.JWT_SECRET,
    });
  }

  public async validate(
    payload: HttpJwtPayload,
  ): Promise<Optional<HttpUserPayload>> {
    return this.authService.getUser({ id: payload.id });
  }
}
