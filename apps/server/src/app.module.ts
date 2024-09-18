import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { InfrastructureModule } from "./di/infrastructure.module";
import { AuthModule } from "./di/auth.module";
import { UserModule } from "./di/user.module";
import { CommentModule } from "./di/comment.module";

@Module({
  imports: [InfrastructureModule, AuthModule, UserModule, CommentModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
