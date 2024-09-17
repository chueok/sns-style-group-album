import { Module, Provider } from "@nestjs/common";
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
import { DiTokens } from "./di/di-tokens";
import { TypeormGroupRepository } from "./infrastructure/persistence/typeorm/repository/group/group-repository";
import { TypeormContentRepository } from "./infrastructure/persistence/typeorm/repository/content/content-repository";
import { TypeormCommentRepository } from "./infrastructure/persistence/typeorm/repository/comment/comment-repository";

const persistenceProviders: Provider[] = [
  {
    provide: DiTokens.UserRepository,
    useClass: TypeormUserRepository,
  },
  {
    provide: DiTokens.GroupRepository,
    useClass: TypeormGroupRepository,
  },
  {
    provide: DiTokens.ContentRepository,
    useClass: TypeormContentRepository,
  },
  {
    provide: DiTokens.CommentRepository,
    useClass: TypeormCommentRepository,
  },
];

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
    ...persistenceProviders,
  ],
})
export class AppModule {}
