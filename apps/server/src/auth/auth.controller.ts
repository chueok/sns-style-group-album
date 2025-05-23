import { Controller, Get, UseGuards, Req, Res } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Request, Response } from 'express';
import { ServerConfig } from '../config/server-config';
import { HttpGoogleAuthGuard } from './guard/google-auth-guard';
import { AuthService } from './auth-service';
import { AuthModuleConfig } from './config';
import { DOauthUserProfile } from './decorator/oauth-user-profile';
import { TOauthUserProfile } from './type/oauth-user-profile';
import { setSecureCookie } from './utils';

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
  async getMe(@Req() req: Request, @Res() res: Response): Promise<void> {
    const { user } = await this.authService.getMe({
      req,
      res,
    });
    res.json({ user });
    // 클라이언트에서 'credentials include' 옵션으로 요청하면 NesgJS의 자동응답을 사용하면 안됨
    // 특정 헤더를 만족해야 하기 때문.
  }
}
