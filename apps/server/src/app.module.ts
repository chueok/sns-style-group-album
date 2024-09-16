import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { typeormSqliteOptions } from "./infrastructure/persistence/typeorm/config/typeorm-config";
import { CommentController } from "./http-rest/controller/comment-controller";
import { AuthController } from "./http-rest/controller/auth-controller";
import { HttpGoogleStrategy } from "./http-rest/auth/passport/http-google-strategy";
import { HttpAuthService } from "./http-rest/auth/http-auth-service";
import { TypeormUserRepository } from "./infrastructure/persistence/typeorm/repository/user/user-repository";
import { JwtModule } from "@nestjs/jwt";
import { ServerConfig } from "./config/server-config";
import { HttpJwtSignupStrategy } from "./http-rest/auth/passport/http-jwt-signup-strategy";

@Module({
  imports: [
    TypeOrmModule.forRoot(typeormSqliteOptions),
    JwtModule.register({
      secret: ServerConfig.JWT_SECRET,
      signOptions: { expiresIn: "30m" },
    }),
  ],
  controllers: [AppController, AuthController, CommentController],
  providers: [
    AppService,
    HttpGoogleStrategy,
    HttpJwtSignupStrategy,
    HttpAuthService,
    TypeormUserRepository,
  ],
})
export class AppModule {}
