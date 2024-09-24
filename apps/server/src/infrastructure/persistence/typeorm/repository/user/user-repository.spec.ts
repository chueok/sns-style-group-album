import { join, basename } from "path";
import { DataSource } from "typeorm";
import { DummyDatabaseHandler } from "@test-utils/persistence/dummy-database-handler";
import { TypeormUserRepository } from "./user-repository";
import { TypeormUser } from "../../entity/user/typeorm-user.entity";
import { TypeormGroup } from "../../entity/group/typeorm-group.entity";
import { UserMapper } from "./mapper/user-mapper";
import { IUserRepository, User, UserId } from "@repo/be-core";
import { Test, TestingModule } from "@nestjs/testing";
import { InfrastructureModule } from "../../../../../di/infrastructure.module";
import { UserFixture } from "@test-utils/fixture/user-fixture";
import assert from "assert";

const parameters = {
  testDbPath: join("db", `${basename(__filename)}.sqlite`),
  dummyDbPath: join("db", "dummy.sqlite"),
};

describe("UserRepository", () => {
  let module: TestingModule;
  let dataSource: DataSource;
  let testDatabaseHandler: DummyDatabaseHandler;
  let userRepository: IUserRepository;

  let userFixture: UserFixture;

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

    userRepository = new TypeormUserRepository(dataSource);

    testDatabaseHandler = new DummyDatabaseHandler(dataSource);

    await testDatabaseHandler.load(parameters.dummyDbPath);

    userFixture = new UserFixture(dataSource);
    await userFixture.init(parameters.dummyDbPath);
  });

  afterAll(async () => {
    await dataSource.destroy();
    await module.close();
  });

  describe("findUserById", () => {
    it("should find a user by id", async () => {
      const targetUser = await userFixture.getValidUser();
      const user = await userRepository.findUserById(targetUser.id);
      expect(user).not.toBeNull();
      expect(user).toBeInstanceOf(User);
      expect(user!.id).toEqual(targetUser.id);
    });

    it("should not find a user by id when an error occurs", async () => {
      const user = await userRepository.findUserById("invalid" as UserId);
      expect(user).toBeNull();
    });
  });

  describe("findUserByGroupId", () => {
    let group: TypeormGroup;
    beforeAll(async () => {
      const targetGroup = testDatabaseHandler
        .getDbCacheList(TypeormGroup)
        .at(0);
      assert(targetGroup, "targetGroup is null");
      group = targetGroup;
    });

    it("should find users by group id", async () => {
      const memberIdList = (await group.members).map((member) => member.id);
      const users = await userRepository.findUserListByGroupId(group.id);
      const userIdList = users.map((user) => user.id);
      expect(userIdList).toEqual(memberIdList);
    });

    it("should not find users by group id when an error occurs", async () => {
      const users = await userRepository.findUserListByGroupId("invalid");
      expect(users).toEqual([]);
    });
  });

  describe("findUserByUsernameOfGroup", () => {
    let user: TypeormUser;
    let group: TypeormGroup;

    beforeAll(async () => {
      user = await userFixture.getValidUser();
      const targetGroup = (await user.groups).at(0);
      assert(targetGroup, "targetGroup is null");
      group = targetGroup;
    });

    it("should find a user by username of group", async () => {
      const foundUser = await userRepository.findUserByUsernameOfGroup({
        username: user.username,
        groupId: group.id,
      });
      expect(foundUser).not.toBeNull();
      expect(foundUser!.id).toEqual(user.id);
    });

    it("should not find a user by username of group when an error occurs", async () => {
      const foundUser = await userRepository.findUserByUsernameOfGroup({
        username: user.username,
        groupId: "invalid",
      });
      expect(foundUser).toBeNull();

      const foundUser2 = await userRepository.findUserByUsernameOfGroup({
        username: "invalid",
        groupId: group.id,
      });
      expect(foundUser2).toBeNull();
    });
  });

  describe("createUser", () => {
    it("should create a user", async () => {
      const dummyOrmUser = testDatabaseHandler.makeDummyUser(false);
      const { results, errors } = (await UserMapper.toDomainEntity({
        elements: [{ user: dummyOrmUser, ownGroups: [], groups: [] }],
      }))!;
      const dummyDomainUser = results[0]!;
      expect(dummyDomainUser).toBeInstanceOf(User);

      const result = await userRepository.createUser(dummyDomainUser);
      expect(result).toBeTruthy();

      const createdUser = await userRepository.findUserById(dummyDomainUser.id);
      expect(createdUser).not.toBeNull();
      expect(createdUser!.id).toEqual(dummyDomainUser.id);
    });

    it("should not create a user when an error occurs", async () => {
      const dummyOrmUser = testDatabaseHandler.makeDummyUser(false);
      const { results, errors } = (await UserMapper.toDomainEntity({
        elements: [{ user: dummyOrmUser, ownGroups: [], groups: [] }],
      }))!;
      const dummyDomainUser = results[0]!;
      (dummyDomainUser as any)._username = undefined;

      const result = await userRepository.createUser(dummyDomainUser);
      expect(result).toBeFalsy();
    });
  });

  describe("updateUser", () => {
    it("should update a user", async () => {
      const user = await userFixture.getValidUser();

      const groups = await user.groups;
      const ownGroups = await user.ownGroups;
      const { results, errors } = (await UserMapper.toDomainEntity({
        elements: [{ user, groups, ownGroups }],
      }))!;
      const domainUser = results[0]!;
      await domainUser.changeUsername("new-username");
      const result = await userRepository.updateUser(domainUser);
      expect(result).toBeTruthy();

      const foundUser = (await userRepository.findUserById(domainUser.id))!;
      expect(foundUser).toEqual(domainUser);
    });
  });

  describe("deleteUserById", () => {
    it("should delete a user by id", async () => {
      const user = await userFixture.getValidUser();
      const result = await userRepository.deleteUserById(user.id);
      expect(result).toBeTruthy();

      const foundUser = await userRepository.findUserById(user.id);
      expect(foundUser).toBeNull();
    });

    it("should not delete a user by id when an error occurs", async () => {
      const result = await userRepository.deleteUserById("invalid" as UserId);
      expect(result).toBeFalsy();
    });
  });
});
