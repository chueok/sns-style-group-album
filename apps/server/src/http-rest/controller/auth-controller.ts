import {
  Body,
  Controller,
  Get,
  Inject,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CookieOptions, Request, Response } from 'express';
import { VerifiedUser } from '../../auth/decorator/verified-user';
import { ServerConfig } from '../../config/server-config';
import assert from 'assert';
import { VerifiedUserPayload } from '../../auth/type/verified-user-payload';
import {
  OauthUserPayload,
  isHttpOauthUserPayload,
} from '../../auth/type/oauth-user-payload';
import { RestAuthSignupBody } from './dto/auth/rest-auth-signup-body';
import { ApiResponseGeneric } from './dto/decorator/api-response-generic';
import { RestResponseSignupJwt } from './dto/auth/rest-response-signup-jwt';
import { RestResponseJwt } from './dto/auth/rest-response-jwt';
import { Code, Exception } from '@repo/be-core';
import { RestResponse } from './dto/common/rest-response';
import { HttpGoogleAuthGuard } from '../../auth/guard/google-auth-guard';
import { DiTokens } from '../../di/di-tokens';
import { SignupAdaptor } from '../../auth/port/signup-port';
import { AuthService } from '../../auth/auth-service';

const AUTH_PATH_NAME = 'auth';
const googleCallbackPath = validateCallbackPath(); // TODO: 과한 것 같음. literal로 하자.

@Controller(AUTH_PATH_NAME)
@ApiTags(AUTH_PATH_NAME)
export class AuthController {
  constructor(
    @Inject(DiTokens.AuthService) private readonly authService: AuthService
  ) {}

  @Get('login/google')
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
    @Res() res: Response
  ): Promise<void> {
    try {
      if (isHttpOauthUserPayload(user)) {
        const token: RestResponseSignupJwt =
          await this.authService.getSignupToken(user);

        setSecureCookie({
          res,
          name: 'signupToken',
          val: token.signupToken,
          cookieOptions: {
            maxAge: 1000 * 60 * 5, // 5분
          },
        });

        return res.redirect(`${ServerConfig.CLIENT_ENDPOINT}/login/redirect`);
      } else {
        const token: RestResponseJwt =
          await this.authService.getLoginToken(user);

        setSecureCookie({
          res,
          name: 'accessToken',
          val: token.accessToken,
          cookieOptions: {
            maxAge: 1000 * 60 * 5, // 5분
          },
        });

        return res.redirect(`${ServerConfig.CLIENT_ENDPOINT}/login/redirect`);
      }
    } catch (error) {
      console.error(error);
      return res.redirect(
        `${ServerConfig.CLIENT_ENDPOINT}/login/redirect?error=true`
      );
    }
  }

  @Post('signup')
  @ApiResponseGeneric({ code: Code.CREATED, data: RestResponseJwt })
  async signup(
    @Req() req: Request,
    @Body() body: RestAuthSignupBody,
    @Res() res: Response
  ): Promise<void> {
    const signupToken = req.signedCookies.signupToken;
    if (!signupToken) {
      throw Exception.new({ code: Code.UNAUTHORIZED_ERROR });
    }

    const adapter = await SignupAdaptor.new({
      signupToken,
      username: body.username,
      email: body.email,
    });

    const loginToken = await this.authService.signup(adapter);

    setSecureCookie({
      res,
      name: 'accessToken',
      val: loginToken.accessToken,
      cookieOptions: {
        path: '/',
        maxAge: 1000 * 60 * 5, // 5분
      },
    });

    res.status(201).json(RestResponse.success(loginToken));
  }
}

function validateCallbackPath() {
  const googleRedirect = ServerConfig.OAUTH_GOOGLE_REDIRECT;
  assert(
    googleRedirect.includes(AUTH_PATH_NAME),
    `oauth redirect path must include ${AUTH_PATH_NAME}`
  );
  const [_, callbackPath] = googleRedirect.split(AUTH_PATH_NAME);
  assert(!!callbackPath, `callback path must be defined`);

  return callbackPath;
}

const setSecureCookie = (input: {
  res: Response;
  name: string;
  val: string;
  cookieOptions?: CookieOptions;
}) => {
  const { res, name, val, cookieOptions = {} } = input;

  res.cookie(name, val, {
    ...cookieOptions,
    httpOnly: true,
    secure: ServerConfig.isProduction,
    sameSite: 'strict',
    domain: ServerConfig.COOKIE_DOMAIN,
  });
};
