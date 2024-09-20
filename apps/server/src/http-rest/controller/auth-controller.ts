import {
  Body,
  Controller,
  Get,
  Inject,
  Post,
  Req,
  UseGuards,
} from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { HttpUser } from "../auth/decorator/http-user";
import { ServerConfig } from "../../config/server-config";
import assert from "assert";
import { HttpUserPayload } from "../auth/type/http-user";
import {
  HttpOauthUserPayload,
  isHttpOauthUserPayload,
} from "../auth/type/http-oauth-user";
import { RestAuthSignupBody } from "./documentation/auth/rest-auth-signup-body";
import { ApiResponseGeneric } from "./documentation/decorator/api-response-generic";
import { RestResponseSignupJwt } from "./documentation/auth/rest-response-signup-jwt";
import { RestResponseJwt } from "./documentation/auth/rest-response-jwt";
import { Code, Exception } from "@repo/be-core";
import { RestResponse } from "./documentation/common/rest-response";
import { HttpGoogleAuthGuard } from "../auth/guard/google-auth-guard";
import { ExtractJwt } from "passport-jwt";
import { DiTokens } from "../../di/di-tokens";
import { IAuthService } from "../auth/auth-service.interface";

const AUTH_PATH_NAME = "auth";
const googleCallbackPath = validateCallbackPath();

@Controller(AUTH_PATH_NAME)
@ApiTags(AUTH_PATH_NAME)
export class AuthController {
  constructor(
    @Inject(DiTokens.AuthService) private readonly authService: IAuthService,
  ) {}

  @Get("login/google")
  @UseGuards(HttpGoogleAuthGuard)
  googleAuth() {
    // redirect google login page
  }

  @Get(googleCallbackPath)
  @UseGuards(HttpGoogleAuthGuard)
  @ApiResponseGeneric({ code: Code.SUCCESS, data: RestResponseJwt })
  @ApiResponseGeneric({
    code: Code.WRONG_CREDENTIALS_ERROR,
    data: RestResponseSignupJwt,
  })
  @ApiResponseGeneric({
    code: Code.UNAUTHORIZED_ERROR,
    data: null,
  })
  async googleAuthCallback(
    @HttpUser() user: HttpUserPayload | HttpOauthUserPayload,
  ): Promise<RestResponse<RestResponseSignupJwt | RestResponseJwt | null>> {
    if (isHttpOauthUserPayload(user)) {
      const token: RestResponseSignupJwt =
        await this.authService.getSignupToken(user);
      return RestResponse.error(
        Code.WRONG_CREDENTIALS_ERROR.code,
        Code.WRONG_CREDENTIALS_ERROR.message,
        token,
      );
    } else {
      const token: RestResponseJwt = await this.authService.getLoginToken(user);
      return RestResponse.success(token);
    }
  }

  @Post("signup")
  @ApiResponseGeneric({ code: Code.CREATED, data: RestResponseJwt })
  @ApiResponseGeneric({
    code: Code.UNAUTHORIZED_ERROR,
    data: null,
    description: "invalid signup-token",
  })
  @ApiResponseGeneric({
    code: Code.BAD_REQUEST_ERROR,
    data: null,
    description: "invalid body",
  })
  async signup(
    @Req() req: Request,
    @Body() body: RestAuthSignupBody,
  ): Promise<RestResponse<RestResponseJwt | null>> {
    const jwt = ExtractJwt.fromAuthHeaderAsBearerToken()(req);
    if (!jwt) {
      throw Exception.new({ code: Code.UNAUTHORIZED_ERROR });
    }

    const signupPayload = await this.authService.validateSignupToken(jwt);
    if (!signupPayload) {
      throw Exception.new({ code: Code.UNAUTHORIZED_ERROR });
    }

    const user = await this.authService.signup({
      signupToken: jwt,
      provider: signupPayload.provider,
      providerId: signupPayload.providerId,
      username: body.username,
      email: body.email,
      thumbnailRelativePath:
        body.thumbnailRelativePath || signupPayload.profileUrl || null,
    });

    if (!user) {
      throw Exception.new({ code: Code.BAD_REQUEST_ERROR });
    }

    const token: RestResponseJwt = await this.authService.getLoginToken(user);
    return RestResponse.success(token);
  }
}

function validateCallbackPath() {
  const googleRedirect = ServerConfig.OAUTH_GOOGLE_REDIRECT;
  assert(
    googleRedirect.includes(AUTH_PATH_NAME),
    `oauth redirect path must include ${AUTH_PATH_NAME}`,
  );
  const [_, callbackPath] = googleRedirect.split(AUTH_PATH_NAME);
  assert(!!callbackPath, `callback path must be defined`);

  return callbackPath;
}
