import { Inject, Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Profile, Strategy, VerifyCallback } from 'passport-google-oauth20';
import { ServerConfig } from '../../../config/server-config';
import { AuthProviderEnum } from '../auth-provider-enum';
import { VerifiedUserPayload } from '../type/verified-user-payload';
import { Code, Exception, Optional } from '@repo/be-core';
import { OauthUserModel, OauthUserPayload } from '../type/oauth-user-payload';
import { validateSync } from 'class-validator';
import { IAuthService } from '../auth-service.interface';
import { DiTokens } from '../../../di/di-tokens';

@Injectable()
export class HttpGoogleStrategy extends PassportStrategy(
  Strategy,
  AuthProviderEnum.GOOGLE
) {
  constructor(
    @Inject(DiTokens.AuthService) private readonly authService: IAuthService
  ) {
    super({
      clientID: ServerConfig.OAUTH_GOOGLE_ID,
      clientSecret: ServerConfig.OAUTH_GOOGLE_SECRET,
      callbackURL: ServerConfig.OAUTH_GOOGLE_REDIRECT,
      scope: ['email', 'profile'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: Profile,
    done: VerifyCallback
  ): Promise<Optional<OauthUserPayload | VerifiedUserPayload>> {
    try {
      const { provider, id, profileUrl, displayName, name, emails } = profile;

      const user = await this.authService.getOauthUser(provider, id);
      // 신규 유저
      if (!user) {
        const oauthUser = new OauthUserModel();
        oauthUser.provider = provider;
        oauthUser.providerId = id;
        oauthUser.profileUrl = profileUrl;
        oauthUser.email = emails?.at(0)?.value || '';
        const errors = validateSync(oauthUser);

        if (errors.length > 0) {
          throw Exception.new({ code: Code.BAD_REQUEST_ERROR });
        }

        return oauthUser.toObject();
      }

      return user;
    } catch (error) {
      done(error);
    }
  }
}
