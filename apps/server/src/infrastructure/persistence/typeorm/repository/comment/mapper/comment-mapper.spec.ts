import { join } from "path";
import { typeormSqliteOptions } from "../../../config/typeorm-config";
import { DataSource } from "typeorm";
import { DummyDatabaseHandler } from "@test-utils/persistence/dummy-database-handler";
import { TypeormComment } from "../../../entity/comment/typeorm-comment.entity";
import { CommentMapper } from "./comment-mapper";
import { Comment } from "@repo/be-core";
import { TypeormContent } from "../../../entity/content/typeorm-content.entity";

const parameters = {
  testDbPath: join("db", `${__filename}.sqlite`),
  dummyDbPath: join("db", "dummy.sqlite"),
};

describe("CommentMapper", () => {
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
      const ormComment = testDatabaseHandler
        .getDbCacheList(TypeormComment)
        .at(-1)!;
      const ormContent = await ormComment.content;
      const domainComment = await CommentMapper.toDomainEntity({
        comment: ormComment,
        content: ormContent,
      });
      expect(domainComment).not.toBeNull();
    });
    it("[array] should convert orm entity to domain entity", async () => {
      const ormContent = testDatabaseHandler
        .getDbCacheList(TypeormContent)
        .at(-1)!;
      const ormCommentList = await ormContent.comments;
      expect(ormCommentList.length).toBeGreaterThan(0);

      const domainCommentList = await CommentMapper.toDomainEntity(
        ormCommentList.map((comment) => {
          return {
            comment,
            content: ormContent,
          };
        }),
      );
      expect(domainCommentList).toBeInstanceOf(Array);
      expect(domainCommentList.length).toEqual(ormCommentList.length);
      domainCommentList.forEach((comment) => {
        expect(comment).not.toBeNull();
      });
    });
  });

  describe("toOrmEntity", () => {
    let domainCommentList: Comment[];
    beforeAll(async () => {
      const ormContent = testDatabaseHandler
        .getDbCacheList(TypeormContent)
        .at(-1)!;
      const ormCommentList = await ormContent.comments;

      domainCommentList = await CommentMapper.toDomainEntity(
        ormCommentList.map((comment) => {
          return {
            comment,
            content: ormContent,
          };
        }),
      );
    });

    it("[single] should convert domain entity to orm entity", () => {
      const domainComment = domainCommentList.at(-1)!;
      const ormComment = CommentMapper.toOrmEntity(domainComment);
      expect(ormComment).not.toBeNull();
    });

    it("[array] should convert domain entity to orm entity", () => {
      const ormCommentList = CommentMapper.toOrmEntity(domainCommentList);
      expect(ormCommentList).toBeInstanceOf(Array);
      expect(ormCommentList.length).toEqual(domainCommentList.length);
      ormCommentList.forEach((ormComment) => {
        expect(ormComment).not.toBeNull();
      });
    });
  });
});
