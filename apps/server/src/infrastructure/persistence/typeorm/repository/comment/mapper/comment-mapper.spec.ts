import { join, basename } from "path";
import { DataSource } from "typeorm";
import { DummyDatabaseHandler } from "@test-utils/persistence/dummy-database-handler";
import { TypeormComment } from "../../../entity/comment/typeorm-comment.entity";
import { CommentMapper } from "./comment-mapper";
import { Comment } from "@repo/be-core";
import { Test, TestingModule } from "@nestjs/testing";
import {
  InfrastructureModule,
  typeormSqliteOptions,
} from "../../../../../../di/infrastructure.module";

const parameters = {
  testDbPath: join("db", `${basename(__filename)}.sqlite`),
  dummyDbPath: join("db", "dummy.sqlite"),
};

describe("CommentMapper", () => {
  let module: TestingModule;
  let dataSource: DataSource;
  let testDatabaseHandler: DummyDatabaseHandler;
  beforeAll(async () => {
    const testDataSource = new DataSource({
      ...typeormSqliteOptions,
      database: parameters.testDbPath,
      synchronize: false,
      dropSchema: false,
    });
    await testDataSource.initialize();

    module = await Test.createTestingModule({
      imports: [InfrastructureModule],
    })
      .overrideProvider(DataSource)
      .useValue(testDataSource)
      .compile();
    dataSource = module.get<DataSource>(DataSource);

    testDatabaseHandler = new DummyDatabaseHandler(dataSource);

    await testDatabaseHandler.load(parameters.dummyDbPath);
  });

  afterAll(async () => {
    await dataSource.destroy();
    await module.close();
  });

  it("should be defined", () => {
    expect(dataSource).toBeDefined();
    expect(testDatabaseHandler).toBeDefined();
  });

  describe("toDomainEntity", () => {
    it("[array] should convert orm entity to domain entity", async () => {
      const ormCommentList = testDatabaseHandler.getDbCacheList(TypeormComment);
      expect(ormCommentList.length).toBeGreaterThan(0);

      const elements = await Promise.all(
        ormCommentList.map(async (comment) => {
          return {
            comment: comment,
            tags: await comment.tags,
          };
        }),
      );

      const mapResult = await CommentMapper.toDomainEntity({
        elements,
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
      const elements = await Promise.all(
        ormCommentList.map(async (comment) => {
          return {
            comment: comment,
            tags: await comment.tags,
          };
        }),
      );

      const mapResult = await CommentMapper.toDomainEntity({
        elements,
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
