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
import { JwtService } from "@nestjs/jwt";

const parameters = {
  testDbPath: join("db", `${basename(__filename)}.sqlite`),
  dummyDbPath: join("db", "dummy.sqlite"),
};

@Controller("test")
class TestController {
  @Get("")
  @UseGuards(HttpJwtAuthGuard)
  public async helloWorld() {
    return "Hello World!";
  }
}

describe(`${HttpJwtAuthGuard.name}`, () => {
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
    const jwtService = testingModule.get(JwtService);

    fixture = new AuthFixture(dataSource, authService, jwtService);
    await fixture.init(parameters.dummyDbPath);
  });

  afterAll(async () => {
    await testingServer.close();
    await testingModule.close();
  });

  it("should return 200 in happy path", async () => {
    const { accessToken, user } = await fixture.get_validUser_accessToken();
    expect(user.deletedDateTime).toBeNull();
    const response = await supertest(testingServer.getHttpServer())
      .get(`/test`)
      .auth(accessToken, { type: "bearer" })
      .expect(Code.SUCCESS.code);
  });

  it("should return 401, if user was deleted", async () => {
    const { accessToken, user } = await fixture.get_deletedUser_accessToken();
    expect(user.deletedDateTime).not.toBeNull();

    const response = await supertest(testingServer.getHttpServer())
      .get(`/test`)
      .auth(accessToken, { type: "bearer" })
      .expect(Code.UNAUTHORIZED_ERROR.code);
  });

  it("should return 401 when accessToken is not valid", async () => {
    const { accessToken, user } =
      await fixture.get_invalidAccessToken_validUser_invalidScretKey();
    const response = await supertest(testingServer.getHttpServer())
      .get(`/test`)
      .auth(accessToken, { type: "bearer" })
      .expect(Code.UNAUTHORIZED_ERROR.code);
  });

  it("should return 401 when accessToken is not valid", async () => {
    const { accessToken, payload } =
      await fixture.get_invalidAccessToken_invalidUser_validScretKey();
    const response = await supertest(testingServer.getHttpServer())
      .get(`/test`)
      .auth(accessToken, { type: "bearer" })
      .expect(Code.UNAUTHORIZED_ERROR.code);
  });
});
