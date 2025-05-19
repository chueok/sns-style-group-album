import {
  Inject,
  Injectable,
  Logger,
  LoggerService,
  Optional as OptionalInject,
} from '@nestjs/common';
import { Code, Exception, Nullable } from '@repo/be-core';
import { JwtService } from '@nestjs/jwt';
import { RestResponseJwt } from './controller/dto/rest-response-jwt';

import { SJwtUser, TJwtUser } from './type/jwt-user';
import { IAuthRepository } from './auth-repository.interface';
import { TOauthUserProfile } from './type/oauth-user-profile';
import { DiTokens } from './di-tokens';

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
  ): Promise<RestResponseJwt> {
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

    return { accessToken: this.jwtService.sign(user) };
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
}
