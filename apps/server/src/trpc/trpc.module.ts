import { Module } from '@nestjs/common';
import { TrpcController } from './trpc.controller';
import { AuthModule } from '../auth/auth.module';
import { UserModule } from '../user/user.module';
import { GroupModule } from '../group/group.module';
import { ContentModule } from '../content/content.module';
import { CommentModule } from '../comment/comment.module';

@Module({
  controllers: [TrpcController],
  imports: [AuthModule, UserModule, GroupModule, ContentModule, CommentModule],
})
export class TrpcModule {}
