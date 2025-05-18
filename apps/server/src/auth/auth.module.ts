import { Module } from '@nestjs/common';
import { AuthController } from '../http-rest/controller/auth-controller';
import { JwtModule } from '@nestjs/jwt';
import { ServerConfig } from '../config/server-config';
import { AuthService } from './auth-service';
import { HttpGoogleStrategy } from './passport/http-google-strategy';

@Module({
  controllers: [AuthController],
  imports: [
    JwtModule.register({
      secret: ServerConfig.JWT_SECRET,
      signOptions: { expiresIn: '30m' },
      verifyOptions: { ignoreExpiration: false },
    }),
  ],
  providers: [AuthService, HttpGoogleStrategy],
  exports: [AuthService],
})
export class AuthModule {}
