import { Test, TestingModule } from "@nestjs/testing";
import { basename, join } from "path";
import { typeormSqliteOptions } from "../../di/infrastructure.module";
import { INestApplication } from "@nestjs/common";
import { AppModule } from "../../app.module";
import request from "supertest";
import { UserFixture } from "@test-utils/fixture/user-fixture";
import { DataSource } from "typeorm";
import { AuthFixture } from "@test-utils/fixture/auth-fixture";
import { IAuthService } from "../auth/auth-service.interface";
import { DiTokens } from "../../di/di-tokens";
import { GroupResponseDTO } from "./dto/group/group-response";
import { GroupController } from "./group-controller";
import { GroupSimpleResponseDTO } from "./dto/group/group-simple-response";
import { assert } from "console";
import { UserSimpleResponseDTO } from "./dto/user/user-simple-response-dto";

const parameters = {
  testDbPath: join("db", `${basename(__filename)}.sqlite`),
  dummyDbPath: join("db", "dummy.sqlite"),
};

describe(`${GroupController.name} e2e`, () => {
  let app: INestApplication;
  let moduleFixture: TestingModule;
  let userFixture: UserFixture;
  let authFixtrue: AuthFixture;

  beforeAll(async () => {
    const testDataSource = new DataSource({
      ...typeormSqliteOptions,
      database: parameters.testDbPath,
      synchronize: false,
      dropSchema: false,
    });
    await testDataSource.initialize();

    moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(DataSource)
      .useValue(testDataSource)
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    const dataSource = moduleFixture.get(DataSource);
    userFixture = new UserFixture(dataSource);
    await userFixture.init(parameters.dummyDbPath);

    const authService = moduleFixture.get<IAuthService>(DiTokens.AuthService);
    authFixtrue = new AuthFixture(dataSource, authService);
    await authFixtrue.init(parameters.dummyDbPath);
  });

  afterAll(async () => {
    await app.close();
    await moduleFixture.close();
  });

  it("/groups/own (GET)", async () => {
    Error.stackTraceLimit = 100;
    const { user, group, accessToken } =
      await authFixtrue.get_group_owner_accessToken();
    assert(!group.deletedDateTime, "group was deleted");

    const result = await request(app.getHttpServer())
      .get("/groups/own")
      .auth(accessToken, { type: "bearer" })
      .expect(200);

    const expectedGroupList = (await user.ownGroups).filter(
      (group) => !group.deletedDateTime,
    );

    const data = result.body.data as GroupSimpleResponseDTO[];
    expect(data.length).toBe(expectedGroupList.length);
  });

  it("/groups/:groupId/members (GET)", async () => {
    const { accessToken, user, group } =
      await authFixtrue.get_group_member_accessToken();
    assert(!group.deletedDateTime, "group was deleted");

    const result = await request(app.getHttpServer())
      .get(`/groups/${group.id}/members`)
      .auth(accessToken, { type: "bearer" })
      .expect(200);

    const data = result.body.data as UserSimpleResponseDTO[];
    expect(data.length).toBe((await group.members).length);
  });

  it("/groups/:groupId (GET)", async () => {
    const { accessToken, user, group } =
      await authFixtrue.get_group_member_accessToken();
    assert(!group.deletedDateTime, "group was deleted");

    const result = await request(app.getHttpServer())
      .get(`/groups/${group.id}`)
      .auth(accessToken, { type: "bearer" })
      .expect(200);

    const data = result.body.data as GroupResponseDTO;
    expect(data.id).toBe(group.id);
    expect(data.name).toBe(group.name);
    expect(data.members.length).toBe((await group.members).length);
    expect(data.ownerId).toBe((await group.owner).id);
    expect(data.createdTimestamp).toBe(group.createdDateTime.getTime());
  });

  describe("/groups/:groupId (PATCH)", () => {
    it("change group name", async () => {
      const { accessToken, user, group } =
        await authFixtrue.get_group_owner_accessToken();

      const newName = "new name";
      const result = await request(app.getHttpServer())
        .patch(`/groups/${group.id}`)
        .auth(accessToken, { type: "bearer" })
        .send({ name: newName })
        .expect(200);

      const data = result.body.data as GroupResponseDTO;
      expect(data.name).toBe(newName);
    });

    it("change group owner", async () => {
      const { accessToken, user, group } =
        await authFixtrue.get_group_owner_accessToken();

      const newOwner = (await group.members).find(
        (member) => member.id !== group.ownerId,
      )!;
      assert(newOwner, "new owner not found");

      const result = await request(app.getHttpServer())
        .patch(`/groups/${group.id}`)
        .auth(accessToken, { type: "bearer" })
        .send({ ownerId: newOwner.id })
        .expect(200);

      const data = result.body.data as GroupResponseDTO;
      expect(data.ownerId).toBe(newOwner.id);
    });

    it("invite user", async () => {
      const { accessToken, user, group } =
        await authFixtrue.get_group_owner_accessToken();

      const usersNotInGroup = await authFixtrue.getUsersNotInGroup(group.id);
      const userIdListNotInGroup = usersNotInGroup.map((user) => user.id);
      await request(app.getHttpServer())
        .patch(`/groups/${group.id}`)
        .auth(accessToken, { type: "bearer" })
        .send({ invitedUserList: userIdListNotInGroup })
        .expect(200);
    });

    it("should return 400 if you pass multiple parameter", async () => {
      const { accessToken, user, group } =
        await authFixtrue.get_group_owner_accessToken();

      await request(app.getHttpServer())
        .patch(`/groups/${group.id}`)
        .auth(accessToken, { type: "bearer" })
        .send({ name: "new name", ownerId: user.id })
        .expect(400);
    });

    it("should return 400 if you pass empty array on invitedUserList", async () => {
      const { accessToken, user, group } =
        await authFixtrue.get_group_owner_accessToken();

      await request(app.getHttpServer())
        .patch(`/groups/${group.id}`)
        .auth(accessToken, { type: "bearer" })
        .send({ invitedUserList: [] })
        .expect(400);
    });
  });

  it("/groups (GET)", async () => {
    const { accessToken, user, group } =
      await authFixtrue.get_group_member_accessToken();

    // 삭제 되지 않은 그룹
    const expectGroupList = (await user.groups).filter(
      (group) => !group.deletedDateTime,
    );

    const result = await request(app.getHttpServer())
      .get("/groups")
      .auth(accessToken, { type: "bearer" })
      .expect(200);

    const data = result.body.data as GroupSimpleResponseDTO[];
    expect(data.length).toBe(expectGroupList.length);
  });
});
