import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { InfrastructureModule } from './di/infrastructure.module';
import { AuthModule } from './di/auth.module';
import { UserController } from './http-rest/controller/user-controller';
import { CommentController } from './http-rest/controller/comment-controller';
import { GroupController } from './http-rest/controller/group-controller';
import { ContentController } from './http-rest/controller/content-controller';

@Module({
  imports: [InfrastructureModule, AuthModule],
  controllers: [
    AppController,
    UserController,
    GroupController,
    CommentController,
    ContentController,
  ],
  providers: [AppService],
})
export class AppModule {}
