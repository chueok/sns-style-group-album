import { join } from "path";
import { DataSource } from "typeorm";
import { typeormSqliteOptions } from "../../config/typeorm-config";
import { DummyDatabaseHandler } from "@test-utils/persistence/dummy-database-handler";
import { TypeormGroup } from "../../entity/group/typeorm-group.entity";
import { TypeormGroupRepository } from "./group-repository";
import { Group } from "@repo/be-core";
import { TypeormUser } from "../../entity/user/typeorm-user.entity";
import { GroupMapper } from "./mapper/group-mapper";

const parameters = {
  testDbPath: join("db", `${__filename}.sqlite`),
  dummyDbPath: join("db", "dummy.sqlite"),
};

describe("GroupRepository", () => {
  let dataSource: DataSource;
  let testDatabaseHandler: DummyDatabaseHandler;
  let groupRepository: TypeormGroupRepository;
  let targetOrmGroup: TypeormGroup;

  beforeAll(async () => {
    dataSource = new DataSource({
      ...typeormSqliteOptions,
      database: parameters.testDbPath,
      synchronize: false,
      dropSchema: false,
    });

    await dataSource.initialize();

    testDatabaseHandler = new DummyDatabaseHandler(dataSource);

    groupRepository = new TypeormGroupRepository(dataSource);

    await testDatabaseHandler.load(parameters.dummyDbPath);

    targetOrmGroup = testDatabaseHandler.getDbCacheList(TypeormGroup).at(-1)!;
  });

  afterAll(async () => {
    await dataSource.destroy();
  });

  it("should be defined", () => {
    expect(dataSource).toBeDefined();
    expect(testDatabaseHandler).toBeDefined();
    expect(groupRepository).toBeDefined();
    expect(targetOrmGroup).toBeDefined();
  });

  describe("findGroupById", () => {
    it("should find a group by id", async () => {
      const group = await groupRepository.findGroupById(targetOrmGroup.id);
      expect(group).not.toBeNull();
      expect(group).toBeInstanceOf(Group);
      expect(group!.id).toEqual(targetOrmGroup.id);
    });

    it("should not find a group by id when an error occurs", async () => {
      const group = await groupRepository.findGroupById("invalid");
      expect(group).toBeNull();
    });
  });
  describe("findGroupListByOwnerId", () => {
    let targetOrmUser: TypeormUser;
    beforeAll(async () => {
      targetOrmUser = testDatabaseHandler.getDbCacheList(TypeormUser).at(-1)!;
    });

    it("should find a group list by owner id", async () => {
      const groups = await groupRepository.findGroupListByOwnerId(
        targetOrmUser.id,
      );

      expect(groups).not.toBeNull();
      expect(groups).toBeInstanceOf(Array);
      expect(groups.length).toEqual((await targetOrmUser.ownGroups).length);
    });

    it("should not find a group list by owner id when an error occurs", async () => {
      const groups = await groupRepository.findGroupListByOwnerId("invalid");
      expect(groups).not.toBeNull();
      expect(groups).toBeInstanceOf(Array);
      expect(groups.length).toEqual(0);
    });
  });
  describe("findGroupListByUserId", () => {
    let targetOrmUser: TypeormUser;
    beforeAll(async () => {
      targetOrmUser = testDatabaseHandler.getDbCacheList(TypeormUser).at(-1)!;
    });

    it("should find a group list by user id", async () => {
      const groups = await groupRepository.findGroupListByUserId(
        targetOrmUser.id,
      );

      expect(groups).not.toBeNull();
      expect(groups).toBeInstanceOf(Array);
      expect(groups.length).toEqual((await targetOrmUser.groups).length);
    });

    it("should not find a group list by user id when an error occurs", async () => {
      const groups = await groupRepository.findGroupListByUserId("invalid");
      expect(groups).not.toBeNull();
      expect(groups).toBeInstanceOf(Array);
      expect(groups.length).toEqual(0);
    });
  });

  describe("createGroup", () => {
    it("should create a group", async () => {
      const dummyOrmGroup = testDatabaseHandler.makeDummyGroup();
      const dummyDomainGroup =
        (await GroupMapper.toDomainEntity(dummyOrmGroup))!;
      expect(dummyDomainGroup).toBeInstanceOf(Group);

      const result = await groupRepository.createGroup(dummyDomainGroup);
      expect(result).toBeTruthy();
    });

    it("should not create a group when an error occurs", async () => {
      const dummyOrmGroup = testDatabaseHandler.makeDummyGroup();
      const dummyDomainGroup =
        (await GroupMapper.toDomainEntity(dummyOrmGroup))!;

      (dummyDomainGroup as any)._createdDateTime = null;

      const result = await groupRepository.createGroup(dummyDomainGroup);
      expect(result).toBeFalsy();
    });
  });

  describe("updateGroup", () => {
    it("should update a group", async () => {
      const targetDomainGroup =
        (await GroupMapper.toDomainEntity(targetOrmGroup))!;
      await targetDomainGroup.changeName("updated name");

      const result = await groupRepository.updateGroup(targetDomainGroup);
      expect(result).toBeTruthy();

      const updatedGroup = await groupRepository.findGroupById(
        targetDomainGroup.id,
      );
      expect(updatedGroup).toEqual(targetDomainGroup);
    });
  });
});
