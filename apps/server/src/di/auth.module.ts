import { Module } from "@nestjs/common";
import { InfrastructureModule } from "./infrastructure.module";
import { AuthController } from "../http-rest/controller/auth-controller";
import { JwtModule } from "@nestjs/jwt";
import { ServerConfig } from "../config/server-config";
import { HttpAuthService } from "../http-rest/auth/http-auth-service";
import { HttpGoogleStrategy } from "../http-rest/auth/passport/http-google-strategy";
import { HttpJwtSignupStrategy } from "../http-rest/auth/passport/http-jwt-signup-strategy";
import { HttpJwtStrategy } from "../http-rest/auth/passport/http-jwt-strategy";
import { UserModule } from "./user.module";

@Module({
  controllers: [AuthController],
  imports: [
    InfrastructureModule,
    JwtModule.register({
      secret: ServerConfig.JWT_SECRET,
      signOptions: { expiresIn: "30m" },
    }),
    UserModule,
  ],
  providers: [
    HttpAuthService,
    HttpGoogleStrategy,
    HttpJwtSignupStrategy,
    HttpJwtStrategy,
  ],
})
export class AuthModule {}
