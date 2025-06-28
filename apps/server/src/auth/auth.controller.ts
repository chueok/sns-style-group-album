import { Controller, Get, UseGuards, Res } from '@nestjs/common';
import { Response } from 'express';
import { ServerConfig } from '../config/server-config';
import { HttpGoogleAuthGuard } from './guard/google-auth-guard';
import { AuthService } from './auth-service';
import { AuthModuleConfig } from './config';
import { DOauthUserProfile } from './decorator/oauth-user-profile';
import { TOauthUserProfile } from './type/oauth-user-profile';
import { setSecureCookie } from './utils';

@Controller('auth')
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
}
