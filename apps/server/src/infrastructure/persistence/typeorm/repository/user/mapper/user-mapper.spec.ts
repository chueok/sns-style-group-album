import { DummyDatabaseHandler } from "@test-utils/persistence/dummy-database-handler";
import { join, basename } from "path";
import { DataSource } from "typeorm";
import { TypeormUser } from "../../../entity/user/typeorm-user.entity";
import { UserMapper } from "./user-mapper";
import { User } from "@repo/be-core";
import { Test, TestingModule } from "@nestjs/testing";
import { InfrastructureModule } from "../../../../../../di/infrastructure.module";

const parameters = {
  testDbPath: join("db", `${basename(__filename)}.sqlite`),
  dummyDbPath: join("db", "dummy.sqlite"),
};

describe("UserMapper", () => {
  let module: TestingModule;
  let dataSource: DataSource;
  let testDatabaseHandler: DummyDatabaseHandler;
  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [
        InfrastructureModule.forRoot({
          database: parameters.testDbPath,
          synchronize: false,
          dropSchema: false,
        }),
      ],
    }).compile();
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
      const ormUserList = testDatabaseHandler.getDbCacheList(TypeormUser);
      const elements = await Promise.all(
        ormUserList.map(async (user) => {
          return {
            user,
            groups: await user.groups,
            ownGroups: await user.ownGroups,
            groupsWithProfile: await user.groupsWithProfile,
          };
        }),
      );

      const { results, errors } = await UserMapper.toDomainEntity({ elements });
      expect(ormUserList.length).toEqual(results.length);
    });
  });

  describe("toOrmEntity", () => {
    let domainUserList: User[];
    beforeAll(async () => {
      const ormUserList = testDatabaseHandler.getDbCacheList(TypeormUser);
      const elements = await Promise.all(
        ormUserList.map(async (user) => {
          return {
            user,
            groups: await user.groups,
            ownGroups: await user.ownGroups,
            groupsWithProfile: await user.groupsWithProfile,
          };
        }),
      );

      const { results, errors } = await UserMapper.toDomainEntity({ elements });
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
