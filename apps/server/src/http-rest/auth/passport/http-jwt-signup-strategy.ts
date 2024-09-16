import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, JwtFromRequestFunction, Strategy } from "passport-jwt";
import { HttpAuthService } from "../http-auth-service";
import { ServerConfig } from "../../../config/server-config";
import { Code, Exception, Optional } from "@repo/be-core";
import { HttpJwtOauthPayload } from "../type/http-jwt";
import { AuthProviderEnum } from "../auth-provider-enum";
import { RestAuthSignupBody } from "../../controller/documentation/auth/rest-auth-signup-body";
import { HttpUserPayload } from "../type/http-user";
import { plainToInstance } from "class-transformer";
import { validateSync } from "class-validator";

@Injectable()
export class HttpJwtSignupStrategy extends PassportStrategy(
  Strategy,
  AuthProviderEnum.JWT_SIGNUP,
) {
  private extractJwtFromRequest: JwtFromRequestFunction;

  constructor(private authService: HttpAuthService) {
    const extractJwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
    super({
      jwtFromRequest: extractJwtFromRequest,
      ignoreExpiration: false,
      secretOrKey: ServerConfig.JWT_SECRET,
      passReqToCallback: true,
    });
    this.extractJwtFromRequest = extractJwtFromRequest;
  }

  public async validate(
    req: Request,
    payload: HttpJwtOauthPayload,
  ): Promise<Optional<HttpUserPayload>> {
    const jwt = this.extractJwtFromRequest(req);
    if (!jwt) {
      return undefined;
    }

    const restAuthsignupBody = plainToInstance(RestAuthSignupBody, req.body);
    const errors = validateSync(restAuthsignupBody);
    if (errors.length > 0) {
      throw Exception.new({ code: Code.BAD_REQUEST_ERROR });
    }
    const body = restAuthsignupBody;

    const user = await this.authService.signup({
      signupToken: jwt,
      provider: payload.provider,
      providerId: payload.providerId,
      username: body.username,
      email: body.email,
      thumbnailRelativePath: body.thumbnailRelativePath || null,
    });
    if (!user) {
      return undefined;
    }
    return user;
  }
}
