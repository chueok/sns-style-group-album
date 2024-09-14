import { TypeOrmModuleOptions } from "@nestjs/typeorm";
import { join } from "path";
import { ServerConfig } from "../../../../config/server-config";

const entitiesPath = join(__dirname, "..", "**", "*.entity.{ts,js}");
const databasePath = join("db", ServerConfig.DB_FILE);

export const typeormSqliteOptions = {
  type: "sqlite",
  database: databasePath,
  autoLoadEntities: true,
  logging: ServerConfig.DB_LOG_ENABLE,
  entities: [entitiesPath],

  // 개발용
  synchronize: true,
  dropSchema: true,
} satisfies TypeOrmModuleOptions;
