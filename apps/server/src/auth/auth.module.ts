import { Module, Provider } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { ServerConfig } from '../config/server-config';
import { AuthService } from './auth-service';
import { HttpGoogleStrategy } from './guard/passport/http-google-strategy';
import { AuthRepository } from './auth-repository';
import { DiTokens } from './di-tokens';
import { AuthModuleConfig } from './config';

const providers: Provider[] = [
  {
    provide: DiTokens.AuthRepository,
    useClass: AuthRepository,
  },
];

@Module({
  controllers: [AuthController],
  imports: [
    JwtModule.register({
      secret: ServerConfig.JWT_SECRET,
      signOptions: {
        expiresIn: AuthModuleConfig.AccessTokenValidTime,
      },
      verifyOptions: { ignoreExpiration: false },
    }),
  ],
  providers: [AuthService, HttpGoogleStrategy, ...providers],
  exports: [AuthService, DiTokens.AuthRepository],
})
export class AuthModule {}
