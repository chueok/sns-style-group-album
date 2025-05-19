import { Module, Provider } from '@nestjs/common';
import { AuthController } from './controller/auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { ServerConfig } from '../config/server-config';
import { AuthService } from './auth-service';
import { HttpGoogleStrategy } from './guard/passport/http-google-strategy';
import { AuthRepository } from './auth-repository';
import { DiTokens } from './di-tokens';

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
      signOptions: { expiresIn: '30m' },
      verifyOptions: { ignoreExpiration: false },
    }),
  ],
  providers: [AuthService, HttpGoogleStrategy, ...providers],
  exports: [AuthService],
})
export class AuthModule {}
