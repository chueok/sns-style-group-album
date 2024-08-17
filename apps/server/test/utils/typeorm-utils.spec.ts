import { DataSource } from "typeorm";
import { TestDatabaseHandler } from "./typeorm-utils";
import { Test, TestingModule } from "@nestjs/testing";
import { TypeOrmModule } from "@nestjs/typeorm";
import { typeormSqliteOptions } from "../../src/infrastructure/persistence/typeorm/config/typeorm-config";
import { TypeormUser } from "../../src/infrastructure/persistence/typeorm/user/typeorm-user.entity";
import { TypeormGroup } from "../../src/infrastructure/persistence/typeorm/group/typeorm-group.entity";
import { TypeormContent } from "../../src/infrastructure/persistence/typeorm/content/typeorm-content.entity";
import {
  TypeormComment,
  TypeormUserComment,
} from "../../src/infrastructure/persistence/typeorm/comment/typeorm-comment.entity";

/**
 * DB 상호작용 Test로, 순차적인 Test가 필요하여 아래와 같이 설정함
 * 1. --runInBand 옵션 사용하여 jest 실행
 * 2. 각각의 unit test를 describe로 감쌈
 */

describe("TestDatabaseHandler", () => {
  let module: TestingModule;
  let dataSource: DataSource;
  let testDatabaseHandler: TestDatabaseHandler;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [TypeOrmModule.forRoot(typeormSqliteOptions)],
    }).compile();

    dataSource = module.get<DataSource>(DataSource);

    testDatabaseHandler = new TestDatabaseHandler(dataSource);

    await testDatabaseHandler.clearDatabase();
  });

  afterAll(async () => {
    // await testDatabaseHnandler.clearDatabase();
    await module.close();
  });

  describe("should create a dummy user", () => {
    it("should create a dummy user", async () => {
      const dummyUser = testDatabaseHandler.makeDummyUser();
      expect(dummyUser instanceof TypeormUser).toBe(true);

      await testDatabaseHandler.commit();

      const foundUser = await dataSource.getRepository(TypeormUser).find();
      expect(foundUser[0]).not.toBeNull();
      expect(foundUser[0]?.id).toBe(dummyUser.id);
    });
  });

  describe("should create a dummy group", () => {
    it("should create a dummy group", async () => {
      const dummyGroup = testDatabaseHandler.makeDummyGroup();
      expect(dummyGroup instanceof TypeormGroup).toBe(true);

      await testDatabaseHandler.commit();

      const foundGroup = await dataSource
        .getRepository(TypeormGroup)
        .findOne({ where: { id: dummyGroup.id } });

      expect(foundGroup).not.toBeNull();
      expect(foundGroup?.id).toBe(dummyGroup.id);
    });
  });

  describe("should create a dummy content", () => {
    it("should create a dummy content", async () => {
      const dummyContent = testDatabaseHandler.makeDummyContent();
      expect(dummyContent instanceof TypeormContent).toBe(true);

      await testDatabaseHandler.commit();

      const foundContent = await dataSource
        .getRepository(TypeormContent)
        .findOne({ where: { id: dummyContent.id } });

      expect(foundContent).not.toBeNull();
      expect(foundContent?.id).toBe(dummyContent.id);
    });
  });

  describe("should create a dummy comment", () => {
    it("should create a dummy comment", async () => {
      const dummyComment = testDatabaseHandler.makeDummyComment();
      expect(dummyComment instanceof TypeormComment).toBe(true);

      await testDatabaseHandler.commit();

      const foundComment = await dataSource
        .getRepository(TypeormComment)
        .findOne({ where: { id: dummyComment.id } });

      expect(foundComment).not.toBeNull();
      expect(foundComment?.id).toBe(dummyComment.id);
    });
  });

  describe("shoud create many dummies", () => {
    beforeEach(async () => {
      await testDatabaseHandler.clearDatabase();
    });
    it("shoud create many dummies", async () => {
      const payload = {
        numUser: 10,
        numGroup: 10,
        numContent: 10,
        numComment: 10,
      };

      await testDatabaseHandler.buildDummyData(payload);

      await testDatabaseHandler.commit();

      const foundUsers = await dataSource.getRepository(TypeormUser).find();
      const foundGroups = await dataSource.getRepository(TypeormGroup).find();
      const foundContents = await dataSource
        .getRepository(TypeormContent)
        .find();
      const foundComments = await dataSource
        .getRepository(TypeormComment)
        .find();

      expect(foundUsers.length).toBe(payload.numUser);
      expect(foundGroups.length).toBe(payload.numGroup);
      expect(foundContents.length).toBe(payload.numContent);
      expect(foundComments.length).toBe(payload.numComment);
    });
  });
});
