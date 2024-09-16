import { Controller, Get, Post, Req, Res, UseGuards } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { ApiExcludeEndpoint, ApiTags } from "@nestjs/swagger";
import { AuthProviderEnum } from "../auth/auth-provider-enum";
import { HttpUser } from "../auth/decorator/http-user";
import { HttpOauthUserPayloadValidator } from "../auth/type/http-oauth-user";
import { ServerConfig } from "../../config/server-config";
import assert from "assert";
import { HttpAuthService } from "../auth/http-auth-service";
import { HttpUserPayload } from "../auth/type/http-user";

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
  googleAuthCallback(
    @HttpUser() user: HttpUserPayload | HttpOauthUserPayloadValidator,
  ) {
    if (user instanceof HttpOauthUserPayloadValidator) {
      console.log("oauth", user);
      return this.authService.signup(user);
    } else {
      console.log("user", user);
      return this.authService.login(user);
    }
  }

  @Post("signup")
  signUp() {
    // sign up
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
