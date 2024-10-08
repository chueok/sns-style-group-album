import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { typeormSqliteOptions } from "./infrastructure/persistence/typeorm/config/typeorm-config";

@Module({
  imports: [TypeOrmModule.forRoot(typeormSqliteOptions)],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
