import { Test } from "@nestjs/testing";
import { TypeOrmModule } from "@nestjs/typeorm";
import { DataSource } from "typeorm";
import { TestDatabaseHandler } from "../../../src/test/typeorm-utils";

import { TypeOrmModuleOptions } from "@nestjs/typeorm";
import { join } from "path";

const rootPath = join(__dirname, "..", "..", "..");
const entitiesPath = join(rootPath, "src", "**", "*.entity.{ts,js}");
const dbPath = join(rootPath, "db", "dummy.sqlite");

(async () => {
  const module = await Test.createTestingModule({
    imports: [
      TypeOrmModule.forRoot({
        type: "sqlite",
        database: dbPath,
        autoLoadEntities: true,
        logging: true,
        entities: [entitiesPath],

        // 개발용
        synchronize: true,
        dropSchema: true,
      }),
    ],
  }).compile();

  const dataSource = module.get<DataSource>(DataSource);
  const testDatabaseHandler = new TestDatabaseHandler(dataSource);
  testDatabaseHandler.buildDummyData({
    numUser: 10,
    numGroup: 4,
    numContent: 100,
    numComment: 300,
  });

  await testDatabaseHandler.commit();

  await module.close();
})();
