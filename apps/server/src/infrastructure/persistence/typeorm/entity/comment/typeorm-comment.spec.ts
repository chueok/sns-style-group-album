import { Test, TestingModule } from "@nestjs/testing";
import { DataSource, Repository } from "typeorm";
import { TypeOrmModule } from "@nestjs/typeorm";
import { join } from "path";
import { TypeormComment } from "./typeorm-comment.entity";
import { DummyDatabaseHandler } from "@test-utils/persistence/dummy-database-handler";
import { typeormSqliteOptions } from "../../config/typeorm-config";

const parameters = {
  testDbPath: join("db", "TypeormComment.sqlite"),
  dummyDbPath: join("db", "dummy.sqlite"),
};

describe("TypeormComment", () => {
  let module: TestingModule;
  let dataSource: DataSource;
  let repository: Repository<TypeormComment>;
  let testDatabaseHandler: DummyDatabaseHandler;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          ...typeormSqliteOptions,
          database: parameters.testDbPath,
          synchronize: false,
          dropSchema: false,
        }),
      ],
    }).compile();

    dataSource = module.get<DataSource>(DataSource);
    repository = dataSource.getRepository(TypeormComment);

    testDatabaseHandler = new DummyDatabaseHandler(dataSource);

    await testDatabaseHandler.load(parameters.dummyDbPath);
  });

  afterAll(async () => {
    await module.close();
  });

  describe("save", () => {
    it("should save normally", async () => {
      const comment = testDatabaseHandler.makeDummyComment();
      const savedComment = await repository.save(comment);
      expectEqualComment(comment, savedComment);
    });
  });

  describe("delete", () => {
    let target!: TypeormComment;
    beforeEach(async () => {
      target = testDatabaseHandler.makeDummyComment();
      target = await repository.save(target);
    });

    it("should exist before delete", async () => {
      expect(target.id).not.toBeNull();
    });

    it("should delete normally", async () => {
      await repository.delete(target.id);
      const deletedComment = await repository.findOneBy({ id: target.id });
      expect(deletedComment).toBeNull();
    });
  });
});

function expectEqualComment(
  comment: TypeormComment,
  savedComment: TypeormComment,
) {
  expect(comment.id).toBe(savedComment.id);
  expect(comment.commentType).toBe(savedComment.commentType);
  expect(comment.text).toBe(savedComment.text);
  expect(comment.contentId).toBe(savedComment.contentId);
  expect(comment.createdDateTime).toBe(savedComment.createdDateTime);
  expect(comment.updatedDateTime).toBe(savedComment.updatedDateTime);
  expect(comment.deletedDateTime).toBe(savedComment.deletedDateTime);
}
