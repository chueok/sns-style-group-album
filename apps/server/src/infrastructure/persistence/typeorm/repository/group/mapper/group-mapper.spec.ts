import { join } from "path";
import { typeormSqliteOptions } from "../../../config/typeorm-config";
import { DataSource } from "typeorm";
import { DummyDatabaseHandler } from "@test-utils/persistence/dummy-database-handler";
import { TypeormGroup } from "../../../entity/group/typeorm-group.entity";
import { GroupMapper } from "./group-mapper";
import { Group } from "@repo/be-core";

const parameters = {
  testDbPath: join("db", "group-mapper.sqlite"),
  dummyDbPath: join("db", "dummy.sqlite"),
};

describe("GroupMapper", () => {
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
    it("[single] should convert orm entity to domain entity", async () => {
      const ormGroup = testDatabaseHandler.getDbCacheList(TypeormGroup)[0]!;
      const domainGroup = await GroupMapper.toDomainEntity(ormGroup);
      expect(domainGroup).toBeInstanceOf(Group);
    });
    it("[array] should convert orm entity to domain entity", async () => {
      const ormGroupList = testDatabaseHandler.getDbCacheList(TypeormGroup);
      const domainGroupList = await GroupMapper.toDomainEntity(ormGroupList);
      expect(ormGroupList.length).toEqual(domainGroupList.length);
    });
  });

  describe("toOrmEntity", () => {
    let domainGroupList: Group[];
    beforeAll(async () => {
      const ormGroupList = testDatabaseHandler.getDbCacheList(TypeormGroup);
      domainGroupList = await GroupMapper.toDomainEntity(ormGroupList);
    });

    it("[single] should convert domain entity to orm entity", () => {
      const domainGroup = domainGroupList[0]!;
      const ormGroup = GroupMapper.toOrmEntity(domainGroup);
      expect(ormGroup).toBeInstanceOf(TypeormGroup);
    });

    it("[array] should convert domain entity to orm entity", () => {
      const ormGroupList = GroupMapper.toOrmEntity(domainGroupList);
      expect(ormGroupList).toBeInstanceOf(Array);
      expect(ormGroupList.length).toEqual(domainGroupList.length);
      ormGroupList.forEach((ormGroup) => {
        expect(ormGroup).toBeInstanceOf(TypeormGroup);
      });
    });
  });
});
