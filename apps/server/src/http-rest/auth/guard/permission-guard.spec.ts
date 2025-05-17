import { NestExpressApplication } from '@nestjs/platform-express';
import { Test, TestingModule } from '@nestjs/testing';
import {
  InfrastructureModule,
  typeormSqliteOptions,
} from '../../../di/infrastructure.module';
import { AuthModule } from '../../../di/auth.module';
import { basename, join } from 'path';
import { Controller, Get, UseGuards } from '@nestjs/common';
import { DataSource } from 'typeorm';
import supertest from 'supertest';
import { Code } from '@repo/be-core';
import { IAuthService } from '../auth-service.interface';
import { DiTokens } from '../../../di/di-tokens';
import { AuthFixture } from '@test-utils/fixture/auth-fixture';
import { JwtService } from '@nestjs/jwt';
import { HttpPermissionGuard } from './permission-guard';
import { Permission, PermissionEnum } from '../decorator/permission';
import { TypeormUser } from '../../../infrastructure/persistence/typeorm/entity/user/typeorm-user.entity';

const parameters = {
  testDbPath: join('db', `${basename(__filename)}.sqlite`),
  dummyDbPath: join('db', 'dummy.sqlite'),
};

@Controller('test')
class TestController {
  /**
   * user permission
   */
  @Get('without-permission-decorator')
  @UseGuards(HttpPermissionGuard)
  public async withoutPermissionDecorator() {
    return 'Hello World!';
  }

  @Get('user')
  @UseGuards(HttpPermissionGuard)
  @Permission(PermissionEnum.USER)
  public async user() {
    return 'Hello World!';
  }

  /**
   * group owner permission
   */
  @Get('group-owner')
  @UseGuards(HttpPermissionGuard)
  @Permission(PermissionEnum.GROUP_OWNER)
  public async groupOwner() {
    return 'Hello World!';
  }

  @Get('group-owner/:groupId')
  @UseGuards(HttpPermissionGuard)
  @Permission(PermissionEnum.GROUP_OWNER)
  public async groupOwnerWithGroupId() {
    return 'Hello World!';
  }

  /**
   * group member permission
   */
  @Get('group-member')
  @UseGuards(HttpPermissionGuard)
  @Permission(PermissionEnum.GROUP_MEMBER)
  public async groupMember() {
    return 'Hello World!';
  }
  @Get('group-member/:groupId')
  @UseGuards(HttpPermissionGuard)
  @Permission(PermissionEnum.GROUP_MEMBER)
  public async groupMemberWithGroupId() {
    return 'Hello World!';
  }

  /**
   * content owner permission
   */
  @Get('content-owner')
  @UseGuards(HttpPermissionGuard)
  @Permission(PermissionEnum.CONTENT_OWNER)
  public async contentOwner() {
    return 'Hello World!';
  }
  @Get('content-owner/content/:contentId')
  @UseGuards(HttpPermissionGuard)
  @Permission(PermissionEnum.CONTENT_OWNER)
  public async contentOwnerWithContentId() {
    return 'Hello World!';
  }
  @Get('content-owner/group/:groupId')
  @UseGuards(HttpPermissionGuard)
  @Permission(PermissionEnum.CONTENT_OWNER)
  public async contentOwnerWithGroupId() {
    return 'Hello World!';
  }
  @Get('content-owner/:groupId/:contentId')
  @UseGuards(HttpPermissionGuard)
  @Permission(PermissionEnum.CONTENT_OWNER)
  public async contentOwnerWithGroupIdAndContentId() {
    return 'Hello World!';
  }
}

describe(`${HttpPermissionGuard.name}`, () => {
  let testingServer: NestExpressApplication;
  let testingModule: TestingModule;

  let fixture: AuthFixture;
  let dataSource: DataSource;

  beforeEach(async () => {
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
    dataSource = testingModule.get(DataSource);
    const jwtService = testingModule.get(JwtService);

    fixture = new AuthFixture(dataSource, authService, jwtService);
    await fixture.init(parameters.dummyDbPath);
  });

  afterEach(async () => {
    await testingServer.close();
    await testingModule.close();
  });

  describe('user permission', () => {
    it('should return 200 if user is valid', async () => {
      const { accessToken, user } = await fixture.get_validUser_accessToken();
      await supertest(testingServer.getHttpServer())
        .get(`/test/user`)
        .auth(accessToken, { type: 'bearer' })
        .expect(Code.SUCCESS.code);

      await supertest(testingServer.getHttpServer())
        .get(`/test/without-permission-decorator`)
        .auth(accessToken, { type: 'bearer' })
        .expect(Code.SUCCESS.code);
    });

    it('should return 401 if user is deleted', async () => {
      const { accessToken, user } = await fixture.get_deletedUser_accessToken();
      const response = await supertest(testingServer.getHttpServer())
        .get(`/test/user`)
        .auth(accessToken, { type: 'bearer' })
        .expect(Code.UNAUTHORIZED_ERROR.code);

      await supertest(testingServer.getHttpServer())
        .get(`/test/without-permission-decorator`)
        .auth(accessToken, { type: 'bearer' })
        .expect(Code.UNAUTHORIZED_ERROR.code);
    });

    it('should return 401 if accessToken is invalid', async () => {
      const { accessToken, user } =
        await fixture.get_invalidAccessToken_validUser_invalidScretKey();
      const response = await supertest(testingServer.getHttpServer())
        .get(`/test/user`)
        .auth(accessToken, { type: 'bearer' })
        .expect(Code.UNAUTHORIZED_ERROR.code);

      await supertest(testingServer.getHttpServer())
        .get(`/test/without-permission-decorator`)
        .auth(accessToken, { type: 'bearer' })
        .expect(Code.UNAUTHORIZED_ERROR.code);
    });

    it('should return 401 if accessToken is empty', async () => {
      const response = await supertest(testingServer.getHttpServer())
        .get(`/test/user`)
        .expect(Code.UNAUTHORIZED_ERROR.code);

      await supertest(testingServer.getHttpServer())
        .get(`/test/without-permission-decorator`)
        .expect(Code.UNAUTHORIZED_ERROR.code);
    });
  });

  describe('group owner permission decorator', () => {
    it('should return 200 if user is valid and group owner', async () => {
      const { accessToken, user, group } =
        await fixture.get_group_owner_accessToken();
      const response = await supertest(testingServer.getHttpServer())
        .get(`/test/group-owner/${group.id}`)
        .auth(accessToken, { type: 'bearer' })
        .expect(Code.SUCCESS.code);
    });

    it('should return 400 if groupId is empty', async () => {
      const { accessToken, user, group } =
        await fixture.get_group_owner_accessToken();
      const response = await supertest(testingServer.getHttpServer())
        .get(`/test/group-owner`)
        .auth(accessToken, { type: 'bearer' })
        .expect(Code.BAD_REQUEST_ERROR.code);
    });

    it('should return 403 if user is not group owner', async () => {
      const { accessToken, user, group } =
        await fixture.get_group_member_accessToken();
      const response = await supertest(testingServer.getHttpServer())
        .get(`/test/group-owner/${group.id}`)
        .auth(accessToken, { type: 'bearer' })
        .expect(Code.ACCESS_DENIED_ERROR.code);
    });

    it('should return 401 if user is not valid', async () => {
      const { accessToken, user, group } =
        await fixture.get_group_owner_accessToken();

      user.deletedDateTime = new Date();
      await dataSource.getRepository(TypeormUser).save(user);

      const response = await supertest(testingServer.getHttpServer())
        .get(`/test/group-owner/${group.id}`)
        .auth(accessToken, { type: 'bearer' })
        .expect(Code.UNAUTHORIZED_ERROR.code);
    });
  });

  describe('group member permission decorator', () => {
    it('should return 200 if user is valid and group member', async () => {
      const { accessToken, user, group } =
        await fixture.get_group_member_accessToken();
      const response = await supertest(testingServer.getHttpServer())
        .get(`/test/group-member/${group.id}`)
        .auth(accessToken, { type: 'bearer' })
        .expect(Code.SUCCESS.code);
    });

    it('should return 400 if groupId is empty', async () => {
      const { accessToken, user, group } =
        await fixture.get_group_member_accessToken();
      const response = await supertest(testingServer.getHttpServer())
        .get(`/test/group-member`)
        .auth(accessToken, { type: 'bearer' })
        .expect(Code.BAD_REQUEST_ERROR.code);
    });

    it('should return 403 if user is not group member', async () => {
      const { accessToken, user } = await fixture.get_validUser_accessToken();
      const group = await fixture.getGroupUserNotIn(user.id);
      const response = await supertest(testingServer.getHttpServer())
        .get(`/test/group-member/${group.id}`)
        .auth(accessToken, { type: 'bearer' })
        .expect(Code.ACCESS_DENIED_ERROR.code);
    });

    it('should return 401 if user is not valid', async () => {
      const { accessToken, user, group } =
        await fixture.get_group_member_accessToken();

      user.deletedDateTime = new Date();
      await dataSource.getRepository(TypeormUser).save(user);

      const response = await supertest(testingServer.getHttpServer())
        .get(`/test/group-owner/${group.id}`)
        .auth(accessToken, { type: 'bearer' })
        .expect(Code.UNAUTHORIZED_ERROR.code);
    });
  });

  describe('content owner permission decorator', () => {
    it('should return 200 if user is valid and content owner', async () => {
      const { content, owner, accessToken, group } =
        await fixture.getContentAndContentOwner();

      const response = await supertest(testingServer.getHttpServer())
        .get(`/test/content-owner/${group.id}/${content.id}`)
        .auth(accessToken, { type: 'bearer' })
        .expect(Code.SUCCESS.code);
    });

    it('should return 400 if groupId is empty', async () => {
      const { content, owner, accessToken, group } =
        await fixture.getContentAndContentOwner();

      const response = await supertest(testingServer.getHttpServer())
        .get(`/test/content-owner/content/${content.id}`)
        .auth(accessToken, { type: 'bearer' })
        .expect(Code.BAD_REQUEST_ERROR.code);
    });

    it('should return 400 if contentId is empty', async () => {
      const { content, owner, accessToken, group } =
        await fixture.getContentAndContentOwner();

      const response = await supertest(testingServer.getHttpServer())
        .get(`/test/content-owner/group/${group.id}`)
        .auth(accessToken, { type: 'bearer' })
        .expect(Code.BAD_REQUEST_ERROR.code);
    });

    it('should return 403 if user is not content owner', async () => {
      const { content, owner, accessToken, group } =
        await fixture.getContentAndContentOwner();

      const { accessToken: otherAccessToken, user: otherUser } =
        await fixture.get_validUser_accessToken();

      const response = await supertest(testingServer.getHttpServer())
        .get(`/test/content-owner/${group.id}/${content.id}`)
        .auth(otherAccessToken, { type: 'bearer' })
        .expect(Code.ACCESS_DENIED_ERROR.code);
    });
  });
});
