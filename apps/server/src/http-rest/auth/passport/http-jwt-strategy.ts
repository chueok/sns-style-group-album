import { Inject, Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { ServerConfig } from "../../../config/server-config";
import { Optional } from "@repo/be-core";
import { VerifiedUserPayload } from "../type/verified-user-payload";
import { JwtUserPayload } from "../type/jwt-user-payload";
import { AuthProviderEnum } from "../auth-provider-enum";
import { DiTokens } from "../../../di/di-tokens";
import { IAuthService } from "../auth-service.interface";

@Injectable()
export class HttpJwtStrategy extends PassportStrategy(
  Strategy,
  AuthProviderEnum.JWT,
) {
  constructor(
    @Inject(DiTokens.AuthService) private readonly authService: IAuthService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: ServerConfig.JWT_SECRET,
    });
  }

  public async validate(
    payload: JwtUserPayload,
  ): Promise<Optional<VerifiedUserPayload>> {
    const user = await this.authService.getUser({ id: payload.id });
    if (!user) {
      return undefined;
    }

    return user;
  }
}
