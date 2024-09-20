import { Module } from "@nestjs/common";
import { InfrastructureModule } from "./infrastructure.module";
import { AuthController } from "../http-rest/controller/auth-controller";
import { JwtModule } from "@nestjs/jwt";
import { ServerConfig } from "../config/server-config";
import { HttpAuthService } from "../http-rest/auth/http-auth-service";
import { HttpGoogleStrategy } from "../http-rest/auth/passport/http-google-strategy";
import { HttpJwtStrategy } from "../http-rest/auth/passport/http-jwt-strategy";

@Module({
  controllers: [AuthController],
  imports: [
    InfrastructureModule.forRoot(),
    JwtModule.register({
      secret: ServerConfig.JWT_SECRET,
      signOptions: { expiresIn: "30m" },
    }),
  ],
  providers: [HttpAuthService, HttpGoogleStrategy, HttpJwtStrategy],
})
export class AuthModule {}
