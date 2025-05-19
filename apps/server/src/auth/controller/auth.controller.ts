import { Controller, Get, Inject, Res, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CookieOptions, Response } from 'express';
import { ServerConfig } from '../../config/server-config';
import { ApiResponseGeneric } from '../../swagger/decorator/api-response-generic';
import { RestResponseJwt } from './dto/rest-response-jwt';
import { Code } from '@repo/be-core';
import { HttpGoogleAuthGuard } from '../guard/google-auth-guard';
import { AuthService } from '../auth-service';
import { AuthModuleConfig } from '../config';
import { DOauthUserProfile } from '../decorator/oauth-user-profile';
import { TOauthUserProfile } from '../type/oauth-user-profile';

@Controller('auth')
@ApiTags('auth')
export class AuthController {
  constructor(@Inject() private readonly authService: AuthService) {}

  @Get('login/google')
  @UseGuards(HttpGoogleAuthGuard)
  googleAuth() {
    // redirect google login page
  }

  /**
   * 로그인 or 회원가입
   */
  @Get(AuthModuleConfig.GoogleCallbackPath)
  @UseGuards(HttpGoogleAuthGuard)
  @ApiResponseGeneric({ code: Code.SUCCESS, data: RestResponseJwt })
  async googleAuthCallback(
    @DOauthUserProfile() oauthUserProfile: TOauthUserProfile,
    @Res() res: Response
  ): Promise<void> {
    const { accessToken } =
      await this.authService.loginOrSignup(oauthUserProfile);

    setSecureCookie({
      res,
      name: AuthModuleConfig.AccessTokenCookieName,
      val: accessToken,
      cookieOptions: {
        maxAge: AuthModuleConfig.AccessTokenValidTime,
      },
    });

    return res.redirect(`${ServerConfig.CLIENT_ENDPOINT}/login/redirect`);
  }
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
