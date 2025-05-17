import { Module, Provider } from '@nestjs/common';
import { AuthController } from '../http-rest/controller/auth-controller';
import { JwtModule } from '@nestjs/jwt';
import { ServerConfig } from '../config/server-config';
import { AuthService } from '../http-rest/auth/auth-service';
import { HttpGoogleStrategy } from '../http-rest/auth/passport/http-google-strategy';
import { DiTokens } from './di-tokens';

const providers: Provider[] = [
  {
    provide: DiTokens.AuthService,
    useClass: AuthService,
  },
];

@Module({
  controllers: [AuthController],
  imports: [
    JwtModule.register({
      secret: ServerConfig.JWT_SECRET,
      signOptions: { expiresIn: '30m' },
      verifyOptions: { ignoreExpiration: false },
    }),
  ],
  providers: [...providers, HttpGoogleStrategy],
  exports: [DiTokens.AuthService],
})
export class AuthModule {}
