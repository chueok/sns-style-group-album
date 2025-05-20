import { Controller, Get, UseGuards, Req, Res } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CookieOptions, Request, Response } from 'express';
import { ServerConfig } from '../config/server-config';
import { HttpGoogleAuthGuard } from './guard/google-auth-guard';
import { AuthService } from './auth-service';
import { AuthModuleConfig } from './config';
import { DOauthUserProfile } from './decorator/oauth-user-profile';
import { TOauthUserProfile } from './type/oauth-user-profile';
import { JwtUserGuard } from './guard/jwt-user-guard';
import { TJwtUser } from './type/jwt-user';
import { Exception } from '@repo/be-core';
import { Code } from '@repo/be-core';

@Controller('auth')
@ApiTags('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

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
  async googleAuthCallback(
    @DOauthUserProfile() oauthUserProfile: TOauthUserProfile,
    @Res() res: Response
  ): Promise<void> {
    const { accessToken, refreshToken } =
      await this.authService.loginOrSignup(oauthUserProfile);

    setSecureCookie({
      res,
      name: AuthModuleConfig.AccessTokenCookieName,
      val: accessToken,
      cookieOptions: {
        maxAge: AuthModuleConfig.AccessTokenMaxAgeInCookie,
      },
    });

    setSecureCookie({
      res,
      name: AuthModuleConfig.RefreshTokenCookieName,
      val: refreshToken,
      cookieOptions: {
        maxAge: AuthModuleConfig.RefreshTokenMaxAgeInCookie,
      },
    });

    return res.redirect(`${ServerConfig.CLIENT_ENDPOINT}/login/redirect`);
  }

  @Get('me')
  @UseGuards(JwtUserGuard)
  async getMe(
    @Req() req: Request,
    @Res() res: Response
  ): Promise<{ user: TJwtUser }> {
    const accessTokenFromCookie =
      req.cookies[AuthModuleConfig.AccessTokenCookieName];
    const refreshTokenFromCookie =
      req.cookies[AuthModuleConfig.RefreshTokenCookieName];

    if (!accessTokenFromCookie && !refreshTokenFromCookie) {
      throw Exception.new({
        code: Code.UNAUTHORIZED_ERROR,
      });
    }

    const { user, accessToken, refreshToken } = await this.authService.getMe({
      accessToken: accessTokenFromCookie,
      refreshToken: refreshTokenFromCookie,
    });

    setSecureCookie({
      res,
      name: AuthModuleConfig.AccessTokenCookieName,
      val: accessToken,
      cookieOptions: {
        maxAge: AuthModuleConfig.AccessTokenMaxAgeInCookie,
      },
    });

    setSecureCookie({
      res,
      name: AuthModuleConfig.RefreshTokenCookieName,
      val: refreshToken,
      cookieOptions: {
        maxAge: AuthModuleConfig.RefreshTokenMaxAgeInCookie,
      },
    });

    return { user };
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
