import { DataSource } from "typeorm";
import { DummyDatabaseHandler } from "../../../test/utils/dummy-database-handler";

export async function makeDummyDB(
  entitiesPath: string,
  dbPath: string,
  nums: {
    numUser: number;
    numGroup: number;
    numContent: number;
    numComment: number;
    numLike: number;
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
  const testDatabaseHandler = new DummyDatabaseHandler(dataSource);
  // TODO : async 아닌데 await 할 때 lint error 필요.
  await testDatabaseHandler.buildDummyData({
    numUser: nums.numUser,
    numGroup: nums.numGroup,
    numContent: nums.numContent,
    numComment: nums.numComment,
    numLike: nums.numLike,
  });

  await testDatabaseHandler.commit();

  await dataSource.destroy();
}
