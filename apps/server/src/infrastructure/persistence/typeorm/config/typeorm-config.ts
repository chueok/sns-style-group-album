import { TypeOrmModuleOptions } from "@nestjs/typeorm";
import { join } from "path";
import { DatabaseConfig } from "../../../config/DatabaseConfig";

const entitiesPath = join(__dirname, "..", "**", "*.entity.{ts,js}");

export const typeormSqliteOptions: TypeOrmModuleOptions = {
  type: "sqlite",
  database: `db/${DatabaseConfig.DB_FILE}`,
  autoLoadEntities: true,
  logging: DatabaseConfig.DB_LOG_ENABLE,
  entities: [entitiesPath],

  // 개발용
  synchronize: true,
  dropSchema: true,
};
