import { Test, TestingModule } from '@nestjs/testing';
import { basename, join } from 'path';
import { typeormSqliteOptions } from '../../di/infrastructure.module';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '../../app.module';
import request from 'supertest';
import { DataSource } from 'typeorm';
import { AuthFixture } from '@test-utils/fixture/auth-fixture';
import { DiTokens } from '../../di/di-tokens';
import { ContentController } from './content-controller';
import { GetContentListQuery } from './dto/content/get-content-list-query';
import { MediaContentResponseDTO } from './dto/content/media-content-response-dto';
import { MockObjectStorage } from '@test-utils/mock/object-storage';
import { ContentUploadUrlDTO } from './dto/content/content-upload-url-dto';
import { CreateMediaListContentBody } from './dto/content/create-media-list-content-body';
import { IContentRepository } from '@repo/be-core';
import { AuthService } from '../../auth/auth-service';

const parameters = {
  testDbPath: join('db', `${basename(__filename)}.sqlite`),
  dummyDbPath: join('db', 'dummy.sqlite'),
};

describe(`${ContentController.name} e2e`, () => {
  let app: INestApplication;
  let moduleFixture: TestingModule;
  let authFixtrue: AuthFixture;
  let testDataSource: DataSource;

  let contentRepository: IContentRepository;

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
    contentRepository = moduleFixture.get(DiTokens.ContentRepository);

    const authService = moduleFixture.get(AuthService);
    authFixtrue = new AuthFixture(dataSource, authService);
    await authFixtrue.init(parameters.dummyDbPath);
  });

  afterEach(async () => {
    await app.close();
    await moduleFixture.close();
  });

  it('/contents/:groupId/medias (GET)', async () => {
    const { user, group, accessToken } =
      await authFixtrue.get_group_member_accessToken();

    const query: GetContentListQuery = {};

    const result = await request(app.getHttpServer())
      .get(`/contents/group/${group.id}/medias`)
      .auth(accessToken, { type: 'bearer' })
      .query(query)
      .expect(200);

    const data = result.body.data as MediaContentResponseDTO[];

    expect(data.length).toBeGreaterThan(0);
  });

  it('/contents/group/:groupId/medias (POST)', async () => {
    const { user, group, accessToken } =
      await authFixtrue.get_group_member_accessToken();
    const body: CreateMediaListContentBody = {
      numContent: 10,
    };
    const result = await request(app.getHttpServer())
      .post(`/contents/group/${group.id}/medias`)
      .auth(accessToken, { type: 'bearer' })
      .send(body)
      .expect(201);

    const data = result.body.data as ContentUploadUrlDTO;
    expect(data.presignedUrlList.length).toBe(body.numContent);
    data.presignedUrlList.forEach((url) => {
      expect(typeof url === 'string').toBeTruthy();
    });
  });

  it('/contents/group/:groupId/content/:contentId (DELETE)', async () => {
    const { accessToken, owner, content } =
      await authFixtrue.getContentAndContentOwner();

    await request(app.getHttpServer())
      .delete(`/contents/group/${content.groupId}/content/${content.id}`)
      .auth(accessToken, { type: 'bearer' })
      .expect(200);

    const foundContent = await contentRepository.findContentById(content.id);
    expect(foundContent).toBeNull();
  });
});
