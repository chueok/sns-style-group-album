import {
  Inject,
  Injectable,
  Logger,
  LoggerService,
  Optional as OptionalInject,
} from '@nestjs/common';
import { Code, Exception, Nullable } from '@repo/be-core';
import { JwtService } from '@nestjs/jwt';
import { SJwtUser, TJwtUser } from './type/jwt-user';
import { IAuthRepository } from './auth-repository.interface';
import { TOauthUserProfile } from './type/oauth-user-profile';
import { DiTokens } from './di-tokens';
import { TAuthTokens } from './type/auth-tokens';
import { AuthModuleConfig } from './config';
import {
  SJwtRefreshPayload,
  TRefreshJwtPayload,
} from './type/refresh-jwt-payload';
import { Request, Response } from 'express';
import { setSecureCookie } from './utils';

@Injectable()
export class AuthService {
  private readonly logger: LoggerService;

  constructor(
    @Inject(DiTokens.AuthRepository)
    private readonly authRepository: IAuthRepository,
    private readonly jwtService: JwtService,
    @OptionalInject() logger?: LoggerService
  ) {
    this.logger = logger || new Logger(AuthService.name);
  }

  public async loginOrSignup(
    oauthUserProfile: TOauthUserProfile
  ): Promise<TAuthTokens> {
    let user: Nullable<TJwtUser> = null;

    try {
      user = await this.authRepository.getOauthUser(
        oauthUserProfile.provider,
        oauthUserProfile.providerId
      );
    } catch (error) {
      throw Exception.new({
        code: Code.INTERNAL_ERROR,
        overrideMessage: 'Failed to get oauth user',
      });
    }

    if (!user) {
      // 신규 유저 생성
      try {
        user = await this.authRepository.createUser(oauthUserProfile);
      } catch (error) {
        throw Exception.new({
          code: Code.INTERNAL_ERROR,
          overrideMessage: 'Failed to create user',
        });
      }
    }

    // access token과 refresh token 생성
    const { accessToken, refreshToken } = await this.generateTokens(user);

    // refresh token 저장
    await this.authRepository.saveRefreshToken(user.id, refreshToken);

    return { accessToken, refreshToken };
  }

  public async getMe(payload: {
    req: Request;
    res: Response;
  }): Promise<{ user: TJwtUser } & TAuthTokens> {
    const { req, res } = payload;

    const accessToken = req.cookies[AuthModuleConfig.AccessTokenCookieName];
    const refreshToken = req.cookies[AuthModuleConfig.RefreshTokenCookieName];
    if (!accessToken && !refreshToken) {
      throw Exception.new({
        code: Code.UNAUTHORIZED_ERROR,
      });
    }

    if (accessToken) {
      const jwtUser = this.validateAccessToken(accessToken);
      return {
        user: jwtUser,
        accessToken,
        refreshToken,
      };
    }

    const {
      user,
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    } = await this.refreshAccessToken(refreshToken);
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

    return {
      user,
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    };
  }

  public validateAccessToken(token: string): TJwtUser {
    let jwtUser: TJwtUser;
    try {
      jwtUser = this.jwtService.verify(token);
      jwtUser = SJwtUser.parse(jwtUser);
    } catch (error) {
      throw Exception.new({
        code: Code.UNAUTHORIZED_ERROR,
      });
    }

    return jwtUser;
  }

  private async refreshAccessToken(
    refreshToken: string
  ): Promise<{ user: TJwtUser } & TAuthTokens> {
    try {
      // refresh token 검증
      const payload = this.jwtService.verify(refreshToken);
      const parseResult = SJwtRefreshPayload.safeParse(payload);
      if (!parseResult.success || parseResult.data.type !== 'refresh') {
        throw Exception.new({
          code: Code.UNAUTHORIZED_ERROR,
        });
      }
      const refreshJwtPayload = parseResult.data;

      // 저장된 refresh token과 비교
      const isValid = await this.authRepository
        .validateRefreshToken(refreshJwtPayload.userId, refreshToken)
        .catch((_e) => false);
      if (!isValid) {
        throw Exception.new({
          code: Code.UNAUTHORIZED_ERROR,
        });
      }

      // 새로운 access token 발급
      const user = await this.authRepository.getUser(refreshJwtPayload.userId);
      if (!user) {
        throw Exception.new({
          code: Code.UNAUTHORIZED_ERROR,
        });
      }

      const { accessToken: newAccessToken, refreshToken: newRefreshToken } =
        await this.generateTokens(user);

      // 새로운 refresh token 저장
      await this.authRepository.saveRefreshToken(user.id, newRefreshToken);

      return {
        user,
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      };
    } catch (error) {
      throw Exception.new({
        code: Code.UNAUTHORIZED_ERROR,
      });
    }
  }

  private async generateTokens(user: TJwtUser): Promise<TAuthTokens> {
    const accessToken = this.jwtService.sign(
      { id: user.id },
      { expiresIn: AuthModuleConfig.AccessTokenValidTime }
    );
    const refreshToken = this.jwtService.sign(
      { userId: user.id, type: 'refresh' } satisfies TRefreshJwtPayload,
      { expiresIn: AuthModuleConfig.RefreshTokenValidTime }
    );

    return { accessToken, refreshToken };
  }
}
