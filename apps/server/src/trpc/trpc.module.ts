import { Module } from '@nestjs/common';
import { TrpcController } from './trpc.controller';
import { AuthModule } from '../auth/auth.module';
import { UserModule } from '../user/user.module';
@Module({
  controllers: [TrpcController],
  imports: [AuthModule, UserModule],
})
export class TrpcModule {}
