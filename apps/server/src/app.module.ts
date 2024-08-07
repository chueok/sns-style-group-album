import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { sqliteDevOptions } from "./infrastructure/persistence/typeorm/config/typeorm-dev-config";

@Module({
  imports: [TypeOrmModule.forRoot(sqliteDevOptions)],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
