import { join, basename } from "path";
import { typeormSqliteOptions } from "../../../config/typeorm-config";
import { DataSource } from "typeorm";
import { DummyDatabaseHandler } from "@test-utils/persistence/dummy-database-handler";
import { TypeormContent } from "../../../entity/content/typeorm-content.entity";
import { ContentMapper } from "./content-mapper";
import { Content } from "@repo/be-core";

const parameters = {
  testDbPath: join("db", `${basename(__filename)}.sqlite`),
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
    it("[array] should convert orm entity to domain entity", async () => {
      const ormContentList = testDatabaseHandler.getDbCacheList(TypeormContent);

      const inputList = await Promise.all(
        ormContentList.map(async (content) => {
          const likeList = await content.likes;
          const commentList = await content.comments;
          const referred = await content.referred;
          return {
            content,
            numLikes: likeList.length,
            likeList,
            numComments: commentList.length,
            commentList,
            referred,
          };
        }),
      );

      const mapResult = await ContentMapper.toDomainEntity({
        elements: inputList,
      });

      const domainContentList = mapResult.results;

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
      const elements = await Promise.all(
        ormContentList.map(async (content) => {
          const likeList = await content.likes;
          const commentList = await content.comments;
          const referred = await content.referred;
          return {
            content,
            numLikes: likeList.length,
            likeList,
            numComments: commentList.length,
            commentList,
            referred,
          };
        }),
      );

      const mapResult = await ContentMapper.toDomainEntity({
        elements,
      });

      domainContentList = mapResult.results;
    });
    it("[array] should convert domain entity to orm entity", async () => {
      const mapResult = ContentMapper.toOrmEntity({
        elements: domainContentList,
      });
      const ormContentList = mapResult.results;
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
