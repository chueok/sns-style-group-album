import { Module } from '@nestjs/common';
import { TrpcController } from './trpc.controller';
import { AuthModule } from '../auth/auth.module';
import { UserModule } from '../user/user.module';
import { GroupModule } from '../group/group.module';
@Module({
  controllers: [TrpcController],
  imports: [AuthModule, UserModule, GroupModule],
})
export class TrpcModule {}
