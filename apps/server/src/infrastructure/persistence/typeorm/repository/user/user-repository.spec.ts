import { join } from "path";
import { DataSource } from "typeorm";
import { typeormSqliteOptions } from "../../config/typeorm-config";
import { DummyDatabaseHandler } from "@test-utils/persistence/dummy-database-handler";
import { TypeormUserRepository } from "./user-repository";
import { TypeormUser } from "../../entity/user/typeorm-user.entity";
import { TypeormGroup } from "../../entity/group/typeorm-group.entity";
import { UserMapper } from "./mapper/user-mapper";
import { User } from "@repo/be-core";

const parameters = {
  testDbPath: join("db", "user-repository.sqlite"),
  dummyDbPath: join("db", "dummy.sqlite"),
};

describe("UserRepository", () => {
  let dataSource: DataSource;
  let testDatabaseHandler: DummyDatabaseHandler;
  let userRepository: TypeormUserRepository;
  let targetOrmUser: TypeormUser;

  beforeAll(async () => {
    dataSource = new DataSource({
      ...typeormSqliteOptions,
      database: parameters.testDbPath,
      synchronize: false,
      dropSchema: false,
    });

    await dataSource.initialize();

    testDatabaseHandler = new DummyDatabaseHandler(dataSource);

    userRepository = new TypeormUserRepository(dataSource);

    await testDatabaseHandler.load(parameters.dummyDbPath);

    targetOrmUser = testDatabaseHandler.getDbCacheList(TypeormUser).at(-1)!;
  });

  describe("findUserById", () => {
    it("should find a user by id", async () => {
      const user = await userRepository.findUserById(targetOrmUser.id);
      expect(user).not.toBeNull();
      expect(user).toBeInstanceOf(User);
      expect(user!.id).toEqual(targetOrmUser.id);
    });

    it("should not find a user by id when an error occurs", async () => {
      const user = await userRepository.findUserById("invalid");
      expect(user).toBeNull();
    });
  });

  describe("findUserByGroupId", () => {
    let group: TypeormGroup;
    beforeAll(async () => {
      const groups = await targetOrmUser.groups;
      group = groups[0]!;
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
    let group: TypeormGroup;

    beforeAll(async () => {
      const groups = await targetOrmUser.groups;
      group = groups[0]!;
    });

    it("should find a user by username of group", async () => {
      const user = await userRepository.findUserByUsernameOfGroup({
        username: targetOrmUser.username,
        groupId: group.id,
      });
      expect(user).not.toBeNull();
      expect(user!.id).toEqual(targetOrmUser.id);
    });

    it("should not find a user by username of group when an error occurs", async () => {
      const user = await userRepository.findUserByUsernameOfGroup({
        username: targetOrmUser.username,
        groupId: "invalid",
      });
      expect(user).toBeNull();

      const user2 = await userRepository.findUserByUsernameOfGroup({
        username: "invalid",
        groupId: group.id,
      });
      expect(user2).toBeNull();
    });
  });

  describe("createUser", () => {
    it("should create a user", async () => {
      const dummyOrmUser = testDatabaseHandler.makeDummyUser();
      const dummyDomainUser = (await UserMapper.toDomainEntity(dummyOrmUser))!;

      const result = await userRepository.createUser(dummyDomainUser);
      expect(result).toBeTruthy();

      const createdUser = await userRepository.findUserById(dummyDomainUser.id);
      expect(createdUser).not.toBeNull();
      expect(createdUser!.id).toEqual(dummyDomainUser.id);
    });

    it("should not create a user when an error occurs", async () => {
      const dummyOrmUser = testDatabaseHandler.makeDummyUser();
      const dummyDomainUser = (await UserMapper.toDomainEntity(dummyOrmUser))!;
      (dummyDomainUser as any)._username = undefined;

      const result = await userRepository.createUser(dummyDomainUser);
      expect(result).toBeFalsy();
    });
  });

  describe("updateUser", () => {
    it("should update a user", async () => {
      const domainUser = (await UserMapper.toDomainEntity(targetOrmUser))!;
      await domainUser.changeUsername("new-username");
      const result = await userRepository.updateUser(domainUser);
      expect(result).toBeTruthy();

      const foundUser = (await userRepository.findUserById(domainUser.id))!;
      expect(foundUser).toEqual(domainUser);
    });
  });
});
