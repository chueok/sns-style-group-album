import { NestExpressApplication } from "@nestjs/platform-express";
import { Test, TestingModule } from "@nestjs/testing";
import { HttpGroupMemberGuard } from "./group-member-guard";
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

const parameters = {
  testDbPath: join("db", `${basename(__filename)}.sqlite`),
  dummyDbPath: join("db", "dummy.sqlite"),
};

@Controller("test")
class TestController {
  @Get(":groupId")
  @UseGuards(HttpJwtAuthGuard, HttpGroupMemberGuard)
  public async byParam() {
    return "Hello World!";
  }

  @Get()
  @UseGuards(HttpJwtAuthGuard, HttpGroupMemberGuard)
  public async byQuery() {
    return "Hello World!";
  }
}

describe(`${HttpGroupMemberGuard.name}`, () => {
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

  it("should return 200", async () => {
    const { accessToken, group } = await fixture.get_group_member_accessToken();
    const response = await supertest(testingServer.getHttpServer())
      .get(`/test/${group.id}`)
      .auth(accessToken, { type: "bearer" })
      .expect(Code.SUCCESS.code);
  });

  it("should return 403 if groupId was delivered by query", async () => {
    const { accessToken, group } = await fixture.get_group_member_accessToken();
    const response = await supertest(testingServer.getHttpServer())
      .get(`/test`)
      .auth(accessToken, { type: "bearer" })
      .query({ groupId: group.id })
      .expect(Code.ACCESS_DENIED_ERROR.code);
  });

  it("should return 200 if groupId was delivered both url and query", async () => {
    const { accessToken, group } = await fixture.get_group_member_accessToken();
    const response = await supertest(testingServer.getHttpServer())
      .get(`/test/${group.id}`)
      .auth(accessToken, { type: "bearer" })
      .query({ groupId: group.id })
      .expect(Code.SUCCESS.code);
  });

  it("should return 403", async () => {
    const { accessToken, group } = await fixture.get_group_member_accessToken();
    const response = await supertest(testingServer.getHttpServer())
      .get(`/test/${group.id}-not-exist`)
      .auth(accessToken, { type: "bearer" })
      .expect(Code.ACCESS_DENIED_ERROR.code);
  });

  it("should return 403", async () => {
    const { accessToken, group, user } =
      await fixture.get_group_member_accessToken();
    const groupUserNotIn = await fixture.getGroupUserNotIn(user.id);
    const response = await supertest(testingServer.getHttpServer())
      .get(`/test/${groupUserNotIn.id}`)
      .auth(accessToken, { type: "bearer" })
      .expect(Code.ACCESS_DENIED_ERROR.code);
  });
});
