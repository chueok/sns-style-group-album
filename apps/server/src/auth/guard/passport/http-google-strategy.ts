import { Inject, Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Profile, Strategy, VerifyCallback } from 'passport-google-oauth20';
import { ServerConfig } from '../../../config/server-config';
import { EPassportStrategy } from './passport-strategies-enum';
import { Code, Exception, Optional } from '@repo/be-core';
import { validateSync } from 'class-validator';
import { DiTokens } from '../../di-tokens';
import { IAuthRepository } from '../../auth-repository.interface';
import { TOauthUserProfile } from '../../type/oauth-user-profile';

@Injectable()
export class HttpGoogleStrategy extends PassportStrategy(
  Strategy,
  EPassportStrategy.GOOGLE
) {
  constructor(
    @Inject(DiTokens.AuthRepository)
    private readonly authRepository: IAuthRepository
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
  ): Promise<Optional<TOauthUserProfile>> {
    try {
      const {
        provider,
        id,
        profileUrl,
        displayName: _1,
        name: _2,
        emails,
      } = profile;

      const oauthUserProfile: TOauthUserProfile = {
        provider,
        providerId: id,
        profileUrl,
        email: emails?.at(0)?.value || '',
      };

      const errors = validateSync(oauthUserProfile);
      if (errors.length > 0) {
        throw Exception.new({ code: Code.BAD_REQUEST_ERROR });
      }

      return oauthUserProfile;
    } catch (error) {
      done(error);
    }
  }
}
