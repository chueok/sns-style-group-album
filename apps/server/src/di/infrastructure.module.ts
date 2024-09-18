import { Module } from "@nestjs/common";
import { TypeOrmModule, TypeOrmModuleOptions } from "@nestjs/typeorm";
import { join } from "path";
import { ServerConfig } from "../config/server-config";

const entitiesPath = join(
  __dirname,
  "..",
  "infrastructure",
  "persistence",
  "typeorm",
  "entity",
  "**",
  "*.entity.{ts,js}",
);
const databasePath = join("db", ServerConfig.DB_FILE);

export const typeormSqliteOptions = {
  type: "sqlite",
  database: databasePath,
  autoLoadEntities: true,
  logging: ServerConfig.DB_LOG_ENABLE,
  entities: [entitiesPath],

  synchronize: ServerConfig.NODE_ENV === "production" ? false : true,
  dropSchema: ServerConfig.NODE_ENV === "production" ? false : true,
} satisfies TypeOrmModuleOptions;

@Module({
  imports: [TypeOrmModule.forRoot(typeormSqliteOptions)],
})
export class InfrastructureModule {
  static forTest(payload: {
    dbPath: string;
    synchronize: boolean;
    dropSchema: boolean;
  }) {
    return {
      module: InfrastructureModule,
      imports: [
        TypeOrmModule.forRoot({
          ...typeormSqliteOptions,
          database: payload.dbPath,
          synchronize: payload.synchronize,
          dropSchema: payload.dropSchema,
        }),
      ],
    };
  }
}
