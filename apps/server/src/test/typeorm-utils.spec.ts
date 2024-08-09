import { DataSource } from "typeorm";
import { TestDatabaseHandler } from "./typeorm-utils";
import { Test, TestingModule } from "@nestjs/testing";
import { TypeOrmModule } from "@nestjs/typeorm";
import { typeormSqliteOptions } from "../infrastructure/persistence/typeorm/config/typeorm-config";
import { TypeormUser } from "../infrastructure/persistence/typeorm/user/typeorm-user.entity";
import { TypeormGroup } from "../infrastructure/persistence/typeorm/group/typeorm-group.entity";
import { TypeormContent } from "../infrastructure/persistence/typeorm/content/typeorm-content.entity";
import {
  TypeormComment,
  TypeormUserComment,
} from "../infrastructure/persistence/typeorm/comment/typeorm-comment.entity";

describe("TestDatabaseHandler", () => {
  let module: TestingModule;
  let dataSource: DataSource;
  let testDatabaseHnandler: TestDatabaseHandler;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [TypeOrmModule.forRoot(typeormSqliteOptions)],
    }).compile();

    dataSource = module.get<DataSource>(DataSource);

    testDatabaseHnandler = new TestDatabaseHandler(dataSource);

    await testDatabaseHnandler.clearDatabase();
  });

  afterAll(async () => {
    // await testDatabaseHnandler.clearDatabase();
    await module.close();
  });

  describe("should create a dummy user", () => {
    it("should create a dummy user", async () => {
      const dummyUser = testDatabaseHnandler.makeDummyUser();
      expect(dummyUser instanceof TypeormUser).toBe(true);

      await testDatabaseHnandler.commit();

      const foundUser = await dataSource.getRepository(TypeormUser).find();
      expect(foundUser[0]).not.toBeNull();
      expect(foundUser[0]?.id).toBe(dummyUser.id);
    });
  });

  describe("should create a dummy group", () => {
    it("should create a dummy group", async () => {
      const dummyGroup = testDatabaseHnandler.makeDummyGroup();
      expect(dummyGroup instanceof TypeormGroup).toBe(true);

      await testDatabaseHnandler.commit();

      const foundGroup = await dataSource
        .getRepository(TypeormGroup)
        .findOne({ where: { id: dummyGroup.id } });

      expect(foundGroup).not.toBeNull();
      expect(foundGroup?.id).toBe(dummyGroup.id);
    });
  });

  describe("should create a dummy content", () => {
    it("should create a dummy content", async () => {
      const dummyContent = testDatabaseHnandler.makeDummyContent();
      expect(dummyContent instanceof TypeormContent).toBe(true);

      await testDatabaseHnandler.commit();

      const foundContent = await dataSource
        .getRepository(TypeormContent)
        .findOne({ where: { id: dummyContent.id } });

      expect(foundContent).not.toBeNull();
      expect(foundContent?.id).toBe(dummyContent.id);
    });
  });

  describe("should create a dummy comment", () => {
    it("should create a dummy comment", async () => {
      const dummyComment = testDatabaseHnandler.makeDummyComment();
      expect(dummyComment instanceof TypeormComment).toBe(true);

      await testDatabaseHnandler.commit();

      const foundComment = await dataSource
        .getRepository(TypeormComment)
        .findOne({ where: { id: dummyComment.id } });

      expect(foundComment).not.toBeNull();
      expect(foundComment?.id).toBe(dummyComment.id);
    });
  });

  describe("shoud create many dummies", () => {
    beforeEach(async () => {
      await testDatabaseHnandler.clearDatabase();
    });
    it("shoud create many dummies", async () => {
      const payload = {
        numUser: 10,
        numGroup: 10,
        numContent: 10,
        numComment: 10,
      };

      await testDatabaseHnandler.buildDummyData(payload);

      await testDatabaseHnandler.commit();

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
