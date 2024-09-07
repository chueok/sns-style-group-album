import { DummyDatabaseHandler } from "@test-utils/persistence/dummy-database-handler";
import { join, basename } from "path";
import { DataSource } from "typeorm";
import { typeormSqliteOptions } from "../../../config/typeorm-config";
import { TypeormUser } from "../../../entity/user/typeorm-user.entity";
import { UserMapper } from "./user-mapper";
import { User } from "@repo/be-core";

const parameters = {
  testDbPath: join("db", `${basename(__filename)}.sqlite`),
  dummyDbPath: join("db", "dummy.sqlite"),
};

describe("UserMapper", () => {
  let dataSource: DataSource;
  let testDatabaseHandler: DummyDatabaseHandler;
  beforeAll(async () => {
    dataSource = new DataSource({
      ...typeormSqliteOptions,
      database: parameters.testDbPath,
      synchronize: false,
      dropSchema: false,
    });

    await dataSource.initialize();

    testDatabaseHandler = new DummyDatabaseHandler(dataSource);

    await testDatabaseHandler.load(parameters.dummyDbPath);
  });

  afterAll(async () => {
    await dataSource.destroy();
  });

  it("should be defined", () => {
    expect(dataSource).toBeDefined();
    expect(testDatabaseHandler).toBeDefined();
  });

  describe("toDomainEntity", () => {
    it("[array] should convert orm entity to domain entity", async () => {
      const ormUserList = testDatabaseHandler.getDbCacheList(TypeormUser);
      const { results, errors } = await UserMapper.toDomainEntity(ormUserList);
      expect(ormUserList.length).toEqual(results.length);
    });
  });

  describe("toOrmEntity", () => {
    let domainUserList: User[];
    beforeAll(async () => {
      const ormUserList = testDatabaseHandler.getDbCacheList(TypeormUser);
      const { results, errors } = await UserMapper.toDomainEntity(ormUserList);
      domainUserList = results;
    });
    it("[array] should convert domain entity to orm entity", async () => {
      const ormUserList = UserMapper.toOrmEntity(domainUserList);
      expect(ormUserList).toBeInstanceOf(Array);
      expect(ormUserList.length).toEqual(domainUserList.length);
      ormUserList.forEach((ormUser) => {
        expect(ormUser).toBeInstanceOf(TypeormUser);
      });
    });
  });
});
