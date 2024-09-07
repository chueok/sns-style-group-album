import { join, basename } from "path";
import { typeormSqliteOptions } from "../../../config/typeorm-config";
import { DataSource } from "typeorm";
import { DummyDatabaseHandler } from "@test-utils/persistence/dummy-database-handler";
import { TypeormComment } from "../../../entity/comment/typeorm-comment.entity";
import { CommentMapper } from "./comment-mapper";
import { Comment } from "@repo/be-core";

const parameters = {
  testDbPath: join("db", `${basename(__filename)}.sqlite`),
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
    it("[array] should convert orm entity to domain entity", async () => {
      const ormCommentList = testDatabaseHandler.getDbCacheList(TypeormComment);
      expect(ormCommentList.length).toBeGreaterThan(0);

      const mapResult = await CommentMapper.toDomainEntity({
        elements: ormCommentList,
      });

      const domainCommentList = mapResult.results;

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
      const ormCommentList = testDatabaseHandler.getDbCacheList(TypeormComment);

      const mapResult = await CommentMapper.toDomainEntity({
        elements: ormCommentList,
      });

      domainCommentList = mapResult.results;
    });

    it("[array] should convert domain entity to orm entity", () => {
      const mapResult = CommentMapper.toOrmEntity({
        elements: domainCommentList,
      });

      const ormCommentList = mapResult.results;

      expect(ormCommentList).toBeInstanceOf(Array);
      expect(ormCommentList.length).toEqual(domainCommentList.length);
      ormCommentList.forEach((ormComment) => {
        expect(ormComment).not.toBeNull();
      });
    });
  });
});
