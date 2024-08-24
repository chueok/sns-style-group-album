import { DataSource } from "typeorm";
import { DummyDatabaseHandler } from "./dummy-database-handler";
import { Test, TestingModule } from "@nestjs/testing";
import { TypeOrmModule } from "@nestjs/typeorm";
import { typeormSqliteOptions } from "../../src/infrastructure/persistence/typeorm/config/typeorm-config";
import { TypeormUser } from "../../src/infrastructure/persistence/typeorm/user/typeorm-user.entity";
import { TypeormGroup } from "../../src/infrastructure/persistence/typeorm/group/typeorm-group.entity";
import { TypeormContent } from "../../src/infrastructure/persistence/typeorm/content/typeorm-content.entity";
import { TypeormComment } from "../../src/infrastructure/persistence/typeorm/comment/typeorm-comment.entity";
import { join } from "path";

const parameters = {
  testDbPath: join("db", "TestDatabaseHandler.sqlite"),
  dummyDbPath: join("db", "dummy.sqlite"),
};

/**
 * DB 상호작용 Test로, 순차적인 Test가 필요하여 아래와 같이 설정함
 * 1. --runInBand 옵션 사용하여 jest 실행
 * 2. 각각의 unit test를 describe로 감쌈
 */

describe("TestDatabaseHandler", () => {
  let module: TestingModule;
  let dataSource: DataSource;
  let testDatabaseHandler: DummyDatabaseHandler;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          ...typeormSqliteOptions,
          database: parameters.testDbPath,
        }),
      ],
    }).compile();

    dataSource = module.get<DataSource>(DataSource);

    testDatabaseHandler = new DummyDatabaseHandler(dataSource);

    await testDatabaseHandler.clearDatabase();
  });

  afterAll(async () => {
    // await testDatabaseHnandler.clearDatabase();
    await module.close();
  });

  it("should create a dummy user", async () => {
    const dummyUser = testDatabaseHandler.makeDummyUser();
    expect(dummyUser instanceof TypeormUser).toBe(true);

    await testDatabaseHandler.commit();

    const foundUser = await dataSource.getRepository(TypeormUser).find();
    expect(foundUser[0]).not.toBeNull();
    expect(foundUser[0]?.id).toBe(dummyUser.id);
  });

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

  it("should loaded db and dummy db", async () => {
    await testDatabaseHandler.load(parameters.dummyDbPath);
    await testDatabaseHandler.commit();

    const dummyDataSource = new DataSource({
      ...typeormSqliteOptions,
      database: parameters.dummyDbPath,
      synchronize: false,
      dropSchema: false,
    });
    await dummyDataSource.initialize();

    const targetUsers = await dataSource.getRepository(TypeormUser).find();
    const targetGroups = await dataSource.getRepository(TypeormGroup).find();
    const targetContents = await dataSource
      .getRepository(TypeormContent)
      .find();
    const targetComments = await dataSource
      .getRepository(TypeormComment)
      .find();

    const firstUser = targetUsers[0]!;
    const firstGroup = targetGroups[0]!;
    const firstContent = targetContents[0]!;
    const firstComment = targetComments[0]!;

    //

    const copiedUsers = await dataSource.getRepository(TypeormUser).find();
    const copiedGroups = await dataSource.getRepository(TypeormGroup).find();
    const copiedContents = await dataSource
      .getRepository(TypeormContent)
      .find();
    const copiedComments = await dataSource
      .getRepository(TypeormComment)
      .find();

    const copiedFirstUser = copiedUsers[0]!;
    const copiedFirstGroup = copiedGroups[0]!;
    const copiedFirstContent = copiedContents[0]!;
    const copiedComment = copiedComments[0]!;

    expect(copiedUsers.length).toBe(targetUsers.length);
    expect(copiedGroups.length).toBe(targetGroups.length);
    expect(copiedContents.length).toBe(targetContents.length);
    expect(copiedComments.length).toBe(targetComments.length);

    expect(copiedFirstUser).toStrictEqual(firstUser);
    expect(copiedFirstGroup).toStrictEqual(firstGroup);
    expect(copiedFirstContent).toStrictEqual(firstContent);
    expect(copiedComment).toStrictEqual(firstComment);
  });

  it("should make dummy after load", async () => {
    await testDatabaseHandler.load(parameters.dummyDbPath);
    await testDatabaseHandler.commit();

    const newComment = testDatabaseHandler.makeDummyComment();
    expect(newComment instanceof TypeormComment).toBe(true);

    await testDatabaseHandler.commit();

    const foundComment = (await dataSource
      .getRepository(TypeormComment)
      .findOneBy({
        id: newComment.id,
      }))!;

    expect(foundComment.id).toEqual(newComment.id);
  });
});
