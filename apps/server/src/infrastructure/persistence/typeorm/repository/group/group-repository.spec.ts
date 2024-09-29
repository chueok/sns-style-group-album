import { join, basename } from "path";
import { DataSource } from "typeorm";
import { TypeormGroup } from "../../entity/group/typeorm-group.entity";
import { TypeormGroupRepository } from "./group-repository";
import {
  CreateGroupEntityPayload,
  Group,
  GroupId,
  UserId,
} from "@repo/be-core";
import { TypeormUser } from "../../entity/user/typeorm-user.entity";
import { GroupMapper } from "./mapper/group-mapper";
import { Test, TestingModule } from "@nestjs/testing";
import {
  InfrastructureModule,
  typeormSqliteOptions,
} from "../../../../../di/infrastructure.module";
import { GroupFixture } from "@test-utils/fixture/group-fixture";
import { v4 } from "uuid";

const parameters = {
  testDbPath: join("db", `${basename(__filename)}.sqlite`),
  dummyDbPath: join("db", "dummy.sqlite"),
};

describe("GroupRepository", () => {
  let module: TestingModule;
  let dataSource: DataSource;
  let groupRepository: TypeormGroupRepository;
  let groupFixture: GroupFixture;

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

    groupRepository = new TypeormGroupRepository(dataSource);

    groupFixture = new GroupFixture(dataSource);
    await groupFixture.init(parameters.dummyDbPath);
  });

  afterAll(async () => {
    await dataSource.destroy();
    await module.close();
  });

  it("should be defined", () => {
    expect(dataSource).toBeDefined();
    expect(groupRepository).toBeDefined();
  });

  describe("findGroupById", () => {
    let targetOrmGroup: TypeormGroup;

    beforeAll(async () => {
      targetOrmGroup = await groupFixture.getExistingGroup();
    });

    it("should find a group by id", async () => {
      const group = await groupRepository.findGroupById(targetOrmGroup.id);
      expect(group).not.toBeNull();
      expect(group).toBeInstanceOf(Group);
      expect(group!.id).toEqual(targetOrmGroup.id);
    });

    it("should not find a group by id when an error occurs", async () => {
      const group = await groupRepository.findGroupById("invalid" as GroupId);
      expect(group).toBeNull();
    });
  });
  describe("findGroupListByOwnerId", () => {
    let targetOrmUser: TypeormUser;
    beforeAll(async () => {
      const { owner, group } =
        await groupFixture.getGroupHavingMembersAndContents();
      targetOrmUser = owner;
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
      const groups = await groupRepository.findGroupListByOwnerId(
        "invalid" as UserId,
      );
      expect(groups).not.toBeNull();
      expect(groups).toBeInstanceOf(Array);
      expect(groups.length).toEqual(0);
    });
  });
  describe("findGroupListByUserId", () => {
    let targetOrmUser: TypeormUser;
    let targetOrmGroups: TypeormGroup[];
    beforeAll(async () => {
      const { user, groups } = await groupFixture.getUserAnsGroups();
      targetOrmUser = user;
      targetOrmGroups = groups;
      console.log("targetOrmUser", targetOrmUser);
    });

    it("should find a group list by user id", async () => {
      const groups = await groupRepository.findGroupListByUserId(
        targetOrmUser.id,
      );

      expect(groups).not.toBeNull();
      expect(groups).toBeInstanceOf(Array);
      expect(groups.length).toEqual(targetOrmGroups.length);
    });

    it("should not find a group list by user id when an error occurs", async () => {
      const groups = await groupRepository.findGroupListByUserId(
        "invalid" as UserId,
      );
      expect(groups).not.toBeNull();
      expect(groups).toBeInstanceOf(Array);
      expect(groups.length).toEqual(0);
    });
  });

  describe("createGroup", () => {
    it("should create a group", async () => {
      const { user, groups } = await groupFixture.getUserAnsGroups();
      const payload: CreateGroupEntityPayload<"new"> = {
        ownerId: user.id,
        name: "new group",
      };
      const newGroup = new Group(payload);

      const result = await groupRepository.createGroup(newGroup);
      expect(result).toBeTruthy();
    });

    it("should not create a group when an error occurs", async () => {
      const payload: CreateGroupEntityPayload<"new"> = {
        ownerId: v4() as UserId,
        name: "new group",
      };
      const newGroup = new Group(payload);

      const result = await groupRepository.createGroup(newGroup);
      expect(result).toBeFalsy();
    });
  });

  describe("updateGroup", () => {
    it("should update a group", async () => {
      const targetOrmGroup = await groupFixture.getExistingGroup();
      const members = (await targetOrmGroup.members).map((member) => member.id);
      const invitedUsers = (await targetOrmGroup.invitedUsers).map(
        (user) => user.id,
      );
      const mapResult = (await GroupMapper.toDomainEntity({
        elements: [{ group: targetOrmGroup, members, invitedUsers }],
      }))!;
      const targetDomainGroup = mapResult.results[0]!;
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
