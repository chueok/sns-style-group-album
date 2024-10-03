import { Test, TestingModule } from "@nestjs/testing";
import { basename, join } from "path";
import { typeormSqliteOptions } from "../../di/infrastructure.module";
import { INestApplication } from "@nestjs/common";
import { AppModule } from "../../app.module";
import request from "supertest";
import { DataSource } from "typeorm";
import { AuthFixture } from "@test-utils/fixture/auth-fixture";
import { IAuthService } from "../auth/auth-service.interface";
import { DiTokens } from "../../di/di-tokens";
import { ContentController } from "./content-controller";
import { GetContentListQuery } from "./dto/content/get-content-list-query";
import { MediaContentResponseDTO } from "./dto/content/media-content-response-dto";
import { MockObjectStorage } from "@test-utils/mock/object-storage";

const parameters = {
  testDbPath: join("db", `${basename(__filename)}.sqlite`),
  dummyDbPath: join("db", "dummy.sqlite"),
};

describe(`${ContentController.name} e2e`, () => {
  let app: INestApplication;
  let moduleFixture: TestingModule;
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

    const authService = moduleFixture.get<IAuthService>(DiTokens.AuthService);
    authFixtrue = new AuthFixture(dataSource, authService);
    await authFixtrue.init(parameters.dummyDbPath);
  });

  afterEach(async () => {
    await app.close();
    await moduleFixture.close();
  });

  it("/contents/:groupId/medias (GET)", async () => {
    const { user, group, accessToken } =
      await authFixtrue.get_group_member_accessToken();

    const query: GetContentListQuery = {};

    const result = await request(app.getHttpServer())
      .get(`/contents/group/${group.id}/medias`)
      .auth(accessToken, { type: "bearer" })
      .query(query)
      .expect(200);

    const data = result.body.data as MediaContentResponseDTO[];

    expect(data.length).toBeGreaterThan(0);
  });
});
