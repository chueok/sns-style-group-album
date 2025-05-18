import { Test, TestingModule } from '@nestjs/testing';
import supertest from 'supertest';
import { NestExpressApplication } from '@nestjs/platform-express';
import { v4 } from 'uuid';
import { basename, join } from 'path';
import { faker } from '@faker-js/faker';
import { Code } from '@repo/be-core';
import { JwtService } from '@nestjs/jwt';
import { AppController } from '../../app.controller';
import { AppService } from '../../app.service';
import {
  InfrastructureModule,
  typeormSqliteOptions,
} from '../../di/infrastructure.module';
import { AuthModule } from '../../auth/auth.module';
import { OauthUserPayload } from '../../auth/type/oauth-user-payload';
import { DiTokens } from '../../di/di-tokens';
import { DataSource } from 'typeorm';
import { AuthService } from '../../auth/auth-service';

const parameters = {
  testDbPath: join('db', `${basename(__filename)}.sqlite`),
};

describe('AuthController', () => {
  let testingServer: NestExpressApplication;
  let testingModule: TestingModule;
  let authService: AuthService;
  let jwtService: JwtService;

  beforeAll(async () => {
    const testDataSource = new DataSource({
      ...typeormSqliteOptions,
      database: parameters.testDbPath,
      synchronize: true,
    });
    await testDataSource.initialize();

    testingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
      imports: [InfrastructureModule, AuthModule],
    })
      .overrideProvider(DataSource)
      .useValue(testDataSource)
      .compile();

    authService = testingModule.get<AuthService>(DiTokens.AuthService);
    jwtService = testingModule.get(JwtService);

    testingServer = testingModule.createNestApplication();
    await testingServer.init();
  });

  afterAll(async () => {
    await testingServer.close();
    await testingModule.close();
  });

  it('should be defined', async () => {
    const response: supertest.Response = await supertest(
      testingServer.getHttpServer()
    )
      .get('/')
      .expect(200, 'Hello World!');
  });

  describe('POST /auth/signup', () => {
    it('should return 201', async () => {
      const signupUser: OauthUserPayload = {
        provider: 'google',
        providerId: v4(),
        profileUrl: faker.internet.url(),
        email: faker.internet.email(),
      };
      const { signupToken } = await authService.getSignupToken(signupUser);
      const username = v4();
      const email = faker.internet.email();

      const response: supertest.Response = await supertest(
        testingServer.getHttpServer()
      )
        .post('/auth/signup')
        .auth(signupToken, { type: 'bearer' })
        .send({ username, email })
        .expect(Code.CREATED.code);
    });

    it('[stale signup-token] should return 401', async () => {
      const signupUser: OauthUserPayload = {
        provider: 'google',
        providerId: v4(),
        profileUrl: faker.internet.url(),
        email: faker.internet.email(),
      };
      const { signupToken } = await authService.getSignupToken(signupUser);
      const username = v4();
      const email = faker.internet.email();

      // Stale the token
      await authService.getSignupToken(signupUser);

      const response: supertest.Response = await supertest(
        testingServer.getHttpServer()
      )
        .post('/auth/signup')
        .auth(signupToken, { type: 'bearer' })
        .send({ username, email })
        .expect(Code.UNAUTHORIZED_ERROR.code);
    });

    it('[empty jwt] should return 401', async () => {
      const username = v4();
      const email = faker.internet.email();

      const response: supertest.Response = await supertest(
        testingServer.getHttpServer()
      )
        .post('/auth/signup')
        .send({ username, email })
        .expect(Code.UNAUTHORIZED_ERROR.code);
    });

    it('[fake jwt] should return 401', async () => {
      const signupUser: OauthUserPayload = {
        provider: 'google',
        providerId: v4(),
        profileUrl: faker.internet.url(),
        email: faker.internet.email(),
      };
      const signupToken = jwtService.sign(signupUser, {
        secret: 'fake-secret',
      });
      const username = v4();
      const email = faker.internet.email();

      const response: supertest.Response = await supertest(
        testingServer.getHttpServer()
      )
        .post('/auth/signup')
        .auth(signupToken, { type: 'bearer' })
        .send({ username, email })
        .expect(Code.UNAUTHORIZED_ERROR.code);
    });

    it('[invalid body] should return 400', async () => {
      const signupUser: OauthUserPayload = {
        provider: 'google',
        providerId: v4(),
        profileUrl: faker.internet.url(),
        email: faker.internet.email(),
      };
      const { signupToken } = await authService.getSignupToken(signupUser);

      const response: supertest.Response = await supertest(
        testingServer.getHttpServer()
      )
        .post('/auth/signup')
        .auth(signupToken, { type: 'bearer' })
        .send({ username: 123, email: 123 })
        .expect(Code.BAD_REQUEST_ERROR.code);
    });
  });
});
