import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { InfrastructureModule } from "./di/infrastructure.module";
import { AuthModule } from "./di/auth.module";

@Module({
  imports: [InfrastructureModule.forRoot(), AuthModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
