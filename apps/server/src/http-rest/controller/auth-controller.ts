import { Controller, Get, Post, UseGuards } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { ApiBody, ApiExcludeEndpoint, ApiTags } from "@nestjs/swagger";
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
  @ApiExcludeEndpoint()
  googleAuthCallback(@HttpUser() user: HttpUserPayload | HttpOauthUserPayload) {
    if (isHttpOauthUserPayload(user)) {
      return this.authService.getSignupToken(user);
    } else {
      return this.authService.getLoginToken(user);
    }
  }

  @Post("signup")
  @UseGuards(AuthGuard(AuthProviderEnum.JWT_SIGNUP))
  @ApiBody({ type: RestAuthSignupBody })
  signUp(@HttpUser() user: HttpUserPayload) {
    return this.authService.getLoginToken(user);
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
