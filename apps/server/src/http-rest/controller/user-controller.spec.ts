import { Test, TestingModule } from "@nestjs/testing";
import { basename, join } from "path";
import { typeormSqliteOptions } from "../../di/infrastructure.module";
import { INestApplication } from "@nestjs/common";
import { AppModule } from "../../app.module";
import request from "supertest";
import { UserController } from "./user-controller";
import { UserFixture } from "@test-utils/fixture/user-fixture";
import { DataSource } from "typeorm";
import { AuthFixture } from "@test-utils/fixture/auth-fixture";
import { IAuthService } from "../auth/auth-service.interface";
import { DiTokens } from "../../di/di-tokens";
import { UserResponseDTO } from "./dto/user/user-response-dto";
import { GetProfileImageUploadUrlResponseDTO } from "./dto/user/get-profile-image-upload-url-response-dto copy";
import { GetUserGroupProfileImageUploadUrlResponseDTO } from "./dto/user/get-user-group-profile-image-upload-url-response-dto";
import { TypeormGroup } from "../../infrastructure/persistence/typeorm/entity/group/typeorm-group.entity";
import { MockObjectStorage } from "@test-utils/mock/object-storage";

const parameters = {
  testDbPath: join("db", `${basename(__filename)}.sqlite`),
  dummyDbPath: join("db", "dummy.sqlite"),
};

describe(`${UserController.name} e2e`, () => {
  let app: INestApplication;
  let moduleFixture: TestingModule;
  let userFixture: UserFixture;
  let authFixtrue: AuthFixture;
  let testDataSource: DataSource;

  beforeEach(async () => {
    testDataSource = new DataSource({
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
      .overrideProvider(DiTokens.MediaObjectStorage)
      .useClass(MockObjectStorage)
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

  afterEach(async () => {
    await app.close();
    await moduleFixture.close();
  });

  it("/users (GET)", async () => {
    const { accessToken, user } =
      await authFixtrue.get_group_owner_accessToken();
    const result = await request(app.getHttpServer())
      .get(`/users`)
      .auth(accessToken, { type: "bearer" })
      .expect(200);

    const data = result.body.data as UserResponseDTO;
    expect(data.id).toBe(user.id);
    expect(data.username).toBe(user.username);
    expect(data.email).toBe(user.email || undefined);
    expect(data.groups).toEqual(
      expect.arrayContaining((await user.groups).map((group) => group.id)),
    );
    expect(data.ownGroups).toEqual(
      expect.arrayContaining((await user.ownGroups).map((group) => group.id)),
    );
    expect(data.createdTimestamp).toBe(user.createdDateTime.getTime());
  });

  it("/users (DELETE)", async () => {
    const { accessToken, user } = await authFixtrue.get_validUser_accessToken();

    // own group 삭제
    const ownGroups = await user.ownGroups;
    await testDataSource
      .getRepository(TypeormGroup)
      .delete(ownGroups.map((group) => group.id));

    await request(app.getHttpServer())
      .delete(`/users`)
      .auth(accessToken, { type: "bearer" })
      .expect(200);
  });

  it("/users (PATCH)", async () => {
    const { accessToken, user } = await authFixtrue.get_validUser_accessToken();

    const result = await request(app.getHttpServer())
      .patch(`/users`)
      .auth(accessToken, { type: "bearer" })
      .send({ username: "new-username" })
      .expect(200);

    const data = result.body.data as UserResponseDTO;
    expect(data.username).toBe("new-username");
  });

  it("/users/profile-image-upload-url (GET)", async () => {
    const { accessToken, user } = await authFixtrue.get_validUser_accessToken();

    const result = await request(app.getHttpServer())
      .get(`/users/profile-image-upload-url`)
      .auth(accessToken, { type: "bearer" })
      .expect(200);

    const data = result.body.data as GetProfileImageUploadUrlResponseDTO;
    expect(typeof data.presignedUrl).toBe("string");
  });

  it("/user/profile/:groupId (PATCH)", async () => {
    const { accessToken, user, group } =
      await authFixtrue.get_group_member_accessToken();

    const result = await request(app.getHttpServer())
      .patch(`/users/profile/${group.id}`)
      .auth(accessToken, { type: "bearer" })
      .send({ nickname: "new-nickname" })
      .expect(200);

    const data = result.body.data as UserResponseDTO;
    const userGroupProfile = data.userGroupProfiles.find(
      (profile) => profile.groupId === group.id,
    );
    expect(userGroupProfile?.nickname).toBe("new-nickname");
  });

  it("/users/profile/:groupId/profile-image-upload-url (GET)", async () => {
    const { accessToken, user, group } =
      await authFixtrue.get_group_member_accessToken();

    const result = await request(app.getHttpServer())
      .get(`/users/profile/${group.id}/profile-image-upload-url`)
      .auth(accessToken, { type: "bearer" })
      .expect(200);

    const data = result.body
      .data as GetUserGroupProfileImageUploadUrlResponseDTO;
    expect(typeof data.presignedUrl).toBe("string");
  });
});
