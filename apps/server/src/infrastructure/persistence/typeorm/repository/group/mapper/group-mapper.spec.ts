import { join, basename } from "path";
import { DataSource } from "typeorm";
import { DummyDatabaseHandler } from "@test-utils/persistence/dummy-database-handler";
import { TypeormGroup } from "../../../entity/group/typeorm-group.entity";
import { GroupMapper } from "./group-mapper";
import { Group } from "@repo/be-core";
import { Test, TestingModule } from "@nestjs/testing";
import {
  InfrastructureModule,
  typeormSqliteOptions,
} from "../../../../../../di/infrastructure.module";

const parameters = {
  testDbPath: join("db", `${basename(__filename)}.sqlite`),
  dummyDbPath: join("db", "dummy.sqlite"),
};

describe("GroupMapper", () => {
  let module: TestingModule;
  let dataSource: DataSource;
  let testDatabaseHandler: DummyDatabaseHandler;
  beforeAll(async () => {
    const testDataSource = new DataSource({
      ...typeormSqliteOptions,
      database: parameters.testDbPath,
      synchronize: false,
      dropSchema: false,
    });
    await testDataSource.initialize();

    module = await Test.createTestingModule({
      imports: [InfrastructureModule],
    })
      .overrideProvider(DataSource)
      .useValue(testDataSource)
      .compile();
    dataSource = module.get<DataSource>(DataSource);

    testDatabaseHandler = new DummyDatabaseHandler(dataSource);

    await testDatabaseHandler.load(parameters.dummyDbPath);
  });

  afterAll(async () => {
    await dataSource.destroy();
    await module.close();
  });

  it("should be defined", () => {
    expect(dataSource).toBeDefined();
    expect(testDatabaseHandler).toBeDefined();
  });

  describe("toDomainEntity", () => {
    it("[array] should convert orm entity to domain entity", async () => {
      const ormGroupList = testDatabaseHandler.getDbCacheList(TypeormGroup);

      const groupElements = await Promise.all(
        ormGroupList.map(async (ormGroup) => {
          const members = (await ormGroup.members).map((member) => member.id);
          return {
            group: ormGroup,
            members,
          };
        }),
      );

      const domainGroupList = await GroupMapper.toDomainEntity({
        elements: groupElements,
      });
      expect(ormGroupList.length).toEqual(domainGroupList.results.length);
    });
  });

  describe("toOrmEntity", () => {
    let domainGroupList: Group[];
    beforeAll(async () => {
      const ormGroupList = testDatabaseHandler.getDbCacheList(TypeormGroup);
      const groupElements = await Promise.all(
        ormGroupList.map(async (ormGroup) => {
          const members = (await ormGroup.members).map((member) => member.id);
          return {
            group: ormGroup,
            members,
          };
        }),
      );
      const mapResult = await GroupMapper.toDomainEntity({
        elements: groupElements,
      });
      domainGroupList = mapResult.results;
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
