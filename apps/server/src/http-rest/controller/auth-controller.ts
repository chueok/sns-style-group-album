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
import { VerifiedUser } from "../auth/decorator/verified-user";
import { ServerConfig } from "../../config/server-config";
import assert from "assert";
import { VerifiedUserPayload } from "../auth/type/verified-user-payload";
import {
  OauthUserPayload,
  isHttpOauthUserPayload,
} from "../auth/type/oauth-user-payload";
import { RestAuthSignupBody } from "./dto/auth/rest-auth-signup-body";
import { ApiResponseGeneric } from "./dto/decorator/api-response-generic";
import { RestResponseSignupJwt } from "./dto/auth/rest-response-signup-jwt";
import { RestResponseJwt } from "./dto/auth/rest-response-jwt";
import { Code, Exception } from "@repo/be-core";
import { RestResponse } from "./dto/common/rest-response";
import { HttpGoogleAuthGuard } from "../auth/guard/google-auth-guard";
import { ExtractJwt } from "passport-jwt";
import { DiTokens } from "../../di/di-tokens";
import { IAuthService } from "../auth/auth-service.interface";
import { SignupAdaptor } from "../auth/port/signup-port";

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
  async googleAuthCallback(
    @VerifiedUser() user: VerifiedUserPayload | OauthUserPayload,
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
  async signup(
    @Req() req: Request,
    @Body() body: RestAuthSignupBody,
  ): Promise<RestResponse<RestResponseJwt>> {
    const jwt = ExtractJwt.fromAuthHeaderAsBearerToken()(req);
    if (!jwt) {
      throw Exception.new({ code: Code.UNAUTHORIZED_ERROR });
    }

    const adapter = await SignupAdaptor.new({
      signupToken: jwt,
      username: body.username,
      email: body.email,
    });

    const loginToken = await this.authService.signup(adapter);

    return RestResponse.success(loginToken);
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
