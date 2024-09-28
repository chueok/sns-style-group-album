import { Test, TestingModule } from "@nestjs/testing";
import { basename, join } from "path";
import { InfrastructureModule } from "../../di/infrastructure.module";
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

const parameters = {
  testDbPath: join("db", `${basename(__filename)}.sqlite`),
  dummyDbPath: join("db", "dummy.sqlite"),
};

describe(`${UserController.name} e2e`, () => {
  let app: INestApplication;
  let userFixture: UserFixture;
  let authFixtrue: AuthFixture;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideModule(InfrastructureModule)
      .useModule(
        InfrastructureModule.forRoot({
          database: parameters.testDbPath,
          synchronize: false,
          dropSchema: false,
        }),
      )
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

  it("/users/:userId (GET)", async () => {
    const { accessToken, user } =
      await authFixtrue.get_group_owner_accessToken();
    const result = await request(app.getHttpServer())
      .get(`/users/${user.id}`)
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

  it("/users/:userId (DELETE)", async () => {
    const { accessToken, user } = await authFixtrue.get_validUser_accessToken();

    await request(app.getHttpServer())
      .delete(`/users/${user.id}`)
      .auth(accessToken, { type: "bearer" })
      .expect(200);
  });

  it("/users/:userId/profile-image (GET)", async () => {
    const { accessToken, user } = await authFixtrue.get_validUser_accessToken();

    const result = await request(app.getHttpServer())
      .get(`/users/${user.id}/profile-image`)
      .auth(accessToken, { type: "bearer" })
      .expect(200);

    const data = result.body.data as GetProfileImageUploadUrlResponseDTO;
    expect(typeof data.presignedUrl).toBe("string");
  });
});
