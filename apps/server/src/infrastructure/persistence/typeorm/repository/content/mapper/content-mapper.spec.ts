import { join } from "path";
import { typeormSqliteOptions } from "../../../config/typeorm-config";
import { DataSource } from "typeorm";
import { DummyDatabaseHandler } from "@test-utils/persistence/dummy-database-handler";
import { TypeormContent } from "../../../entity/content/typeorm-content.entity";
import { ContentMapper } from "./content-mapper";
import { Content } from "@repo/be-core";

const parameters = {
  testDbPath: join("db", `${__filename}.sqlite`),
  dummyDbPath: join("db", "dummy.sqlite"),
};

describe("ContentMapper", () => {
  let dataSource: DataSource;
  let testDatabaseHandler: DummyDatabaseHandler;
  beforeAll(async () => {
    dataSource = new DataSource({
      ...typeormSqliteOptions,
      database: parameters.testDbPath,
      synchronize: false,
      dropSchema: false,
    });

    await dataSource.initialize();

    testDatabaseHandler = new DummyDatabaseHandler(dataSource);

    await testDatabaseHandler.load(parameters.dummyDbPath);
  });

  afterAll(async () => {
    await dataSource.destroy();
  });

  it("should be defined", () => {
    expect(dataSource).toBeDefined();
    expect(testDatabaseHandler).toBeDefined();
  });

  describe("toDomainEntity", () => {
    it("[single] should convert orm entity to domain entity", async () => {
      const ormContent = testDatabaseHandler
        .getDbCacheList(TypeormContent)
        .at(-1)!;
      const likeList = await ormContent.likes;
      const commentList = await ormContent.comments;
      const domainContent = await ContentMapper.toDomainEntity({
        content: ormContent,
        numLikes: 10,
        likeList,
        numComments: 10,
        commentList,
      });

      expect(domainContent).not.toBeNull();
      expect(domainContent?.likeList.length).toEqual(likeList.length);
      expect(domainContent?.commentList.length).toEqual(commentList.length);
    });
    it("[array] should convert orm entity to domain entity", async () => {
      const ormContentList = testDatabaseHandler.getDbCacheList(TypeormContent);

      const inputList = await Promise.all(
        ormContentList.map(async (content) => {
          const likeList = await content.likes;
          const commentList = await content.comments;
          return {
            content,
            numLikes: likeList.length,
            likeList,
            numComments: commentList.length,
            commentList,
          };
        }),
      );

      const domainContentList = await ContentMapper.toDomainEntity(inputList);
      expect(domainContentList).toBeInstanceOf(Array);
      expect(ormContentList.length).toEqual(domainContentList.length);
      domainContentList.forEach((content) => {
        expect(content).not.toBeNull();
      });
    });
  });

  describe("toOrmEntity", () => {
    let domainContentList: Content[];
    beforeAll(async () => {
      const ormContentList = testDatabaseHandler.getDbCacheList(TypeormContent);

      domainContentList = await ContentMapper.toDomainEntity(
        await Promise.all(
          ormContentList.map(async (content) => {
            const likeList = await content.likes;
            const commentList = await content.comments;
            return {
              content,
              numLikes: likeList.length,
              likeList,
              numComments: commentList.length,
              commentList,
            };
          }),
        ),
      );
    });
    it("[single] should convert domain entity to orm entity", async () => {
      const domainContent = domainContentList.at(-1)!;
      const ormContent = ContentMapper.toOrmEntity(domainContent);
      expect(ormContent).not.toBeNull();
      expect(ormContent.likeList.length).toEqual(domainContent.likeList.length);
      expect((await ormContent.content.comments).length).toEqual(
        domainContent.commentList.length,
      );
    });
    it("[array] should convert domain entity to orm entity", async () => {
      const ormContentList = ContentMapper.toOrmEntity(domainContentList);
      expect(ormContentList).toBeInstanceOf(Array);
      expect(ormContentList.length).toEqual(domainContentList.length);
      ormContentList.forEach((ormContent, index) => {
        expect(ormContent).not.toBeNull();
        expect(ormContent.likeList.length).toEqual(
          domainContentList.at(index)!.likeList.length,
        );
      });
    });
  });
});
