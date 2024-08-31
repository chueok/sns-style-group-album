import { Test, TestingModule } from "@nestjs/testing";
import { join } from "path";
import { DataSource, Repository } from "typeorm";
import { TypeormGroup } from "./typeorm-group.entity";
import { TypeOrmModule } from "@nestjs/typeorm";
import { typeormSqliteOptions } from "../config/typeorm-config";
import { TypeormContent } from "../content/typeorm-content.entity";
import { TypeormUser } from "../user/typeorm-user.entity";
import { DummyDatabaseHandler } from "@test-utils/persistence/dummy-database-handler";

const parameters = {
  testDbPath: join("db", "TypeormGroup.sqlite"),
  dummyDbPath: join("db", "dummy.sqlite"),
};

describe("TypeormGroup", () => {
  let module: TestingModule;
  let dataSource: DataSource;
  let repository: Repository<TypeormGroup>;
  let testDatabaseHandler: DummyDatabaseHandler;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          ...typeormSqliteOptions,
          database: parameters.testDbPath,
          synchronize: false,
          dropSchema: false,
        }),
      ],
    }).compile();

    dataSource = module.get<DataSource>(DataSource);
    repository = dataSource.getRepository(TypeormGroup);

    testDatabaseHandler = new DummyDatabaseHandler(dataSource);

    await testDatabaseHandler.load(parameters.dummyDbPath);
  });

  afterAll(async () => {
    await module.close();
  });

  describe("save", () => {
    it("should save normally", async () => {
      const group = testDatabaseHandler.makeDummyGroup();
      const savedGroup = await repository.save(group);
      await expectEqualGroup(group, savedGroup);
    });
  });
  describe("delete", () => {
    let targetGroup: TypeormGroup;
    let targetOwner: TypeormUser;
    let targetMembers: TypeormUser[];
    let targetContents: TypeormContent[];
    beforeAll(async () => {
      const groupList = testDatabaseHandler.getDbCacheList(TypeormGroup);
      for (const group of groupList.reverse()) {
        let conditionFlag = true;
        if ((await group.members).length === 0) {
          conditionFlag = false;
        }

        const contents = await getGroupContents(dataSource, group.id);
        if (contents.length === 0) {
          conditionFlag = false;
        }

        if (conditionFlag) {
          targetGroup = group;
          targetOwner = await targetGroup.owner;
          targetMembers = await targetGroup.members;
          targetContents = contents;
          break;
        }
      }
      await repository.delete(targetGroup.id);
    });

    it("targetGroup should be defined", async () => {
      expect(targetGroup).not.toBeNull();
      expect(targetOwner).not.toBeNull();
      expect(targetMembers).not.toBeNull();
    });

    it("targetGroup should be deleted", async () => {
      const foundGroup = await dataSource
        .getRepository(TypeormGroup)
        .findOneBy({ id: targetGroup.id });
      expect(foundGroup).toBeNull();
    });

    it("member user should not be deleted", async () => {
      expect(targetMembers.length).toBeGreaterThan(0);
      await Promise.all(
        targetMembers.map(async (member) => {
          const foundMember = await dataSource
            .getRepository(TypeormUser)
            .findOneBy({ id: member.id });
          expect(foundMember).not.toBeNull();
        }),
      );
    });

    it("owner user should not be deleted", async () => {
      expect(targetOwner.id).not.toBeNull();
      const foundOwner = await dataSource
        .getRepository(TypeormUser)
        .findOneBy({ id: targetOwner.id });
      expect(foundOwner).not.toBeNull();
    });

    it("content should be deleted by cascade", async () => {
      await Promise.all(
        targetContents.map(async (content) => {
          const foundContent = await dataSource
            .getRepository(TypeormContent)
            .findOneBy({ id: content.id });
          expect(foundContent).toBeNull();
        }),
      );
    });
  });
});

async function expectEqualGroup(lhs: TypeormGroup, rhs: TypeormGroup) {
  expect(lhs.id).toEqual(rhs.id);
  expect(lhs.name).toEqual(rhs.name);
  expect(await lhs.members).toEqual(await rhs.members);
  expect(await lhs.owner).toEqual(await rhs.owner);

  expect(lhs.createdDateTime).toEqual(rhs.createdDateTime);
  expect(lhs.updatedDateTime).toEqual(rhs.updatedDateTime);
  expect(lhs.deletedDateTime).toEqual(rhs.deletedDateTime);
}

async function getGroupContents(dataSource: DataSource, groupId: string) {
  return dataSource
    .getRepository(TypeormContent)
    .createQueryBuilder("content")
    .where("content.groupId = :groupId", { groupId })
    .getMany();
}
