import { DummyDatabaseHandler } from "@test-utils/persistence/dummy-database-handler";
import { join, basename } from "path";
import { DataSource } from "typeorm";
import { TypeormUser } from "../../../entity/user/typeorm-user.entity";
import { UserMapper } from "./user-mapper";
import { User } from "@repo/be-core";
import { Test, TestingModule } from "@nestjs/testing";
import {
  InfrastructureModule,
  typeormSqliteOptions,
} from "../../../../../../di/infrastructure.module";
import { TypeormUserGroupProfile } from "../../../entity/user-group-profile/typeorm-user-group-profile.entity";

const parameters = {
  testDbPath: join("db", `${basename(__filename)}.sqlite`),
  dummyDbPath: join("db", "dummy.sqlite"),
};

describe("UserMapper", () => {
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
      const ormUserList = testDatabaseHandler.getDbCacheList(TypeormUser);
      const elements = await Promise.all(
        ormUserList.map(async (user) => {
          const invitedGroups = await user.invitedGroups;
          const invitedGroupsElements = await Promise.all(
            invitedGroups.map(async (invitedGroup) => {
              const memberProfiles = await invitedGroup.memberProfiles;
              const owner = await invitedGroup.owner;
              return { group: invitedGroup, memberProfiles, owner };
            }),
          );
          return {
            user,
            groups: await user.groups,
            ownGroups: await user.ownGroups,
            userGroupProfiles: await user.userGroupProfiles,
            invitedGroupsElements,
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
          const invitedGroups = await user.invitedGroups;
          const invitedGroupsElements = await Promise.all(
            invitedGroups.map(async (invitedGroup) => {
              const memberProfiles = await invitedGroup.memberProfiles;
              const owner = await invitedGroup.owner;
              return { group: invitedGroup, memberProfiles, owner };
            }),
          );
          return {
            user,
            groups: await user.groups,
            ownGroups: await user.ownGroups,
            userGroupProfiles: await user.userGroupProfiles,
            invitedGroupsElements,
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
      ormUserList.forEach(({ user, userGroupProfile }) => {
        expect(user).toBeInstanceOf(TypeormUser);
        expect(userGroupProfile).toBeInstanceOf(Array);
        userGroupProfile.forEach((profile) => {
          expect(profile).toBeInstanceOf(TypeormUserGroupProfile);
        });
      });
    });
  });
});
