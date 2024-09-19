import { Controller, Get, Post, UseGuards } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { ApiBody, ApiTags } from "@nestjs/swagger";
import { AuthProviderEnum } from "../auth/auth-provider-enum";
import { HttpUser } from "../auth/decorator/http-user";
import { ServerConfig } from "../../config/server-config";
import assert from "assert";
import { HttpAuthService } from "../auth/http-auth-service";
import { HttpUserPayload } from "../auth/type/http-user";
import {
  HttpOauthUserPayload,
  isHttpOauthUserPayload,
} from "../auth/type/http-oauth-user";
import { RestAuthSignupBody } from "./documentation/auth/rest-auth-signup-body";
import { ApiResponseGeneric } from "./documentation/common/decorator/api-response-generic";
import { RestResponseSignupJwt } from "./documentation/auth/rest-response-signup-jwt";
import { RestResponseJwt } from "./documentation/auth/rest-response-jwt";
import { Code } from "@repo/be-core";
import { RestResponse } from "./documentation/common/rest-response";

const AUTH_PATH_NAME = "auth";
const googleCallbackPath = validateCallbackPath();

@Controller(AUTH_PATH_NAME)
@ApiTags(AUTH_PATH_NAME)
export class AuthController {
  constructor(private readonly authService: HttpAuthService) {}

  @Get("login/google")
  @UseGuards(AuthGuard(AuthProviderEnum.GOOGLE))
  googleAuth() {
    // redirect google login page
  }

  @Get(googleCallbackPath)
  @UseGuards(AuthGuard(AuthProviderEnum.GOOGLE))
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
  ) {
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
  @UseGuards(AuthGuard(AuthProviderEnum.JWT_SIGNUP))
  @ApiBody({ type: RestAuthSignupBody })
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
  async signUp(@HttpUser() user: HttpUserPayload) {
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
