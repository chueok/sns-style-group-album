import { Module } from '@nestjs/common';
import { TrpcController } from './trpc.controller';
import { AuthModule } from '../auth/auth.module';
@Module({
  controllers: [TrpcController],
  imports: [AuthModule],
})
export class TrpcModule {}
