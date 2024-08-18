import { DataSource } from "typeorm";
import { TestDatabaseHandler } from "../../../test/utils/typeorm-utils";

export async function makeDummyDB(
  entitiesPath: string,
  dbPath: string,
  nums: {
    numUser: number;
    numGroup: number;
    numContent: number;
    numComment: number;
  },
) {
  const dataSource = new DataSource({
    type: "sqlite",
    database: dbPath,
    logging: false,
    entities: [entitiesPath],

    // 개발용
    synchronize: true,
    dropSchema: true,
  });
  await dataSource.initialize();
  const testDatabaseHandler = new TestDatabaseHandler(dataSource);
  await testDatabaseHandler.buildDummyData({
    numUser: nums.numUser,
    numGroup: nums.numGroup,
    numContent: nums.numContent,
    numComment: nums.numComment,
  });

  await testDatabaseHandler.commit();

  await dataSource.destroy();
}
