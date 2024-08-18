import { TypeOrmModuleOptions } from "@nestjs/typeorm";
import { join } from "path";
import { DatabaseConfig } from "../../../config/DatabaseConfig";

const entitiesPath = join(__dirname, "..", "**", "*.entity.{ts,js}");
const databasePath = join("db", DatabaseConfig.DB_FILE);

export const typeormSqliteOptions = {
  type: "sqlite",
  database: databasePath,
  autoLoadEntities: true,
  logging: DatabaseConfig.DB_LOG_ENABLE,
  entities: [entitiesPath],

  // 개발용
  synchronize: true,
  dropSchema: true,
} satisfies TypeOrmModuleOptions;
