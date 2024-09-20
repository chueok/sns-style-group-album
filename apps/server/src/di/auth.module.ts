import { Module, Provider } from "@nestjs/common";
import { AuthController } from "../http-rest/controller/auth-controller";
import { JwtModule } from "@nestjs/jwt";
import { ServerConfig } from "../config/server-config";
import { HttpAuthService } from "../http-rest/auth/http-auth-service";
import { HttpGoogleStrategy } from "../http-rest/auth/passport/http-google-strategy";
import { HttpJwtStrategy } from "../http-rest/auth/passport/http-jwt-strategy";
import { DiTokens } from "./di-tokens";

const providers: Provider[] = [
  {
    provide: DiTokens.AuthService,
    useClass: HttpAuthService,
  },
];

@Module({
  controllers: [AuthController],
  imports: [
    JwtModule.register({
      secret: ServerConfig.JWT_SECRET,
      signOptions: { expiresIn: "30m" },
    }),
  ],
  providers: [...providers, HttpGoogleStrategy, HttpJwtStrategy],
  exports: [DiTokens.AuthService],
})
export class AuthModule {}
