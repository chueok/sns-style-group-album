import { NestExpressApplication } from "@nestjs/platform-express";
import { Test, TestingModule } from "@nestjs/testing";
import {
  InfrastructureModule,
  typeormSqliteOptions,
} from "../../../di/infrastructure.module";
import { AuthModule } from "../../../di/auth.module";
import { basename, join } from "path";
import { Controller, Get, UseGuards } from "@nestjs/common";
import { DataSource } from "typeorm";
import supertest from "supertest";
import { Code } from "@repo/be-core";
import { HttpJwtAuthGuard } from "./jwt-auth-guard";
import { IAuthService } from "../auth-service.interface";
import { DiTokens } from "../../../di/di-tokens";
import { AuthFixture } from "@test-utils/fixture/auth-fixture";
import { HttpGroupOwnerGuard } from "./group-owner-guard";

const parameters = {
  testDbPath: join("db", `${basename(__filename)}.sqlite`),
  dummyDbPath: join("db", "dummy.sqlite"),
};

@Controller("test")
class TestController {
  @Get(":groupId")
  @UseGuards(HttpJwtAuthGuard, HttpGroupOwnerGuard)
  public async helloWorld() {
    return "Hello World!";
  }
}

describe(`${HttpGroupOwnerGuard.name}`, () => {
  let testingServer: NestExpressApplication;
  let testingModule: TestingModule;

  let fixture: AuthFixture;

  beforeAll(async () => {
    const testDataSource = new DataSource({
      ...typeormSqliteOptions,
      database: parameters.testDbPath,
      synchronize: true,
    });
    await testDataSource.initialize();

    testingModule = await Test.createTestingModule({
      controllers: [TestController],
      providers: [],
      imports: [InfrastructureModule, AuthModule],
    })
      .overrideProvider(DataSource)
      .useValue(testDataSource)
      .compile();

    testingServer = testingModule.createNestApplication();
    await testingServer.init();

    const authService = testingModule.get<IAuthService>(DiTokens.AuthService);
    const dataSource = testingModule.get(DataSource);

    fixture = new AuthFixture(dataSource, authService);
    await fixture.init(parameters.dummyDbPath);
  });

  afterAll(async () => {
    await testingServer.close();
    await testingModule.close();
  });

  it("should return 200 in happy path", async () => {
    const { accessToken, group } = await fixture.get_group_owner_accessToken();
    const response = await supertest(testingServer.getHttpServer())
      .get(`/test/${group.id}`)
      .auth(accessToken, { type: "bearer" })
      .expect(Code.SUCCESS.code);
  });

  it("should return 403 when user is not owner", async () => {
    const { accessToken, group } = await fixture.get_group_member_accessToken();
    const response = await supertest(testingServer.getHttpServer())
      .get(`/test/${group.id}`)
      .auth(accessToken, { type: "bearer" })
      .expect(Code.ACCESS_DENIED_ERROR.code);
  });

  it("should return 403 when group is not exist", async () => {
    const { accessToken, group } = await fixture.get_group_owner_accessToken();
    const response = await supertest(testingServer.getHttpServer())
      .get(`/test/${group.id}-not-exist`)
      .auth(accessToken, { type: "bearer" })
      .expect(Code.ACCESS_DENIED_ERROR.code);
  });

  it("should return 403 when user is not a member of the group", async () => {
    const { accessToken, group, user } =
      await fixture.get_group_owner_accessToken();
    console.log(group, user);
    const groupUserNotIn = await fixture.getGroupUserNotIn(user.id);
    const response = await supertest(testingServer.getHttpServer())
      .get(`/test/${groupUserNotIn.id}`)
      .auth(accessToken, { type: "bearer" })
      .expect(Code.ACCESS_DENIED_ERROR.code);
  });
});
