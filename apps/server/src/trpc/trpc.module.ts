import { Module } from '@nestjs/common';
import { TrpcController } from './trpc.controller';
import { AuthModule } from '../auth/auth.module';
import { UserModule } from '../domain/user/user.module';
import { GroupModule } from '../domain/group/group.module';
import { ContentModule } from '../domain/content/content.module';
import { CommentModule } from '../domain/comment/comment.module';

@Module({
  controllers: [TrpcController],
  imports: [AuthModule, UserModule, GroupModule, ContentModule, CommentModule],
})
export class TrpcModule {}
