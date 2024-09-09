import { Test, TestingModule } from "@nestjs/testing";
import { DataSource, Repository } from "typeorm";
import { TypeOrmModule } from "@nestjs/typeorm";
import { typeormSqliteOptions } from "../../config/typeorm-config";
import { join, basename } from "path";
import {
  TypeormBucket,
  TypeormContent,
  TypeormMedia,
  TypeormPost,
  TypeormSchedule,
  TypeormSystemContent,
} from "./typeorm-content.entity";
import { ContentTypeEnum } from "@repo/be-core";
import { TypeormComment } from "../comment/typeorm-comment.entity";
import { DummyDatabaseHandler } from "@test-utils/persistence/dummy-database-handler";
import { TypeormLike } from "../like/typeorm-like.entity";

const parameters = {
  testDbPath: join("db", `${basename(__filename)}.sqlite`),
  dummyDbPath: join("db", "dummy.sqlite"),
};

describe("TypeormContent", () => {
  let module: TestingModule;
  let dataSource: DataSource;
  let repository: Repository<TypeormContent>;
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
    repository = dataSource.getRepository(TypeormContent);

    testDatabaseHandler = new DummyDatabaseHandler(dataSource);

    await testDatabaseHandler.load(parameters.dummyDbPath);
  });

  afterAll(async () => {
    await module.close();
  });

  describe("save", () => {
    it("bucket", async () => {
      const content = await testDatabaseHandler.makeDummyContent({
        type: ContentTypeEnum.BUCKET,
      });
      const savedContent = await repository.save(content);
      await expectEqualContent(content, savedContent);
    });

    it("image", async () => {
      const content = await testDatabaseHandler.makeDummyContent({
        type: ContentTypeEnum.IMAGE,
      });
      const savedContent = await repository.save(content);
      await expectEqualContent(content, savedContent);
    });

    it("post", async () => {
      const content = await testDatabaseHandler.makeDummyContent({
        type: ContentTypeEnum.POST,
      });
      const savedContent = await repository.save(content);
      await expectEqualContent(content, savedContent);
    });

    it("schedule", async () => {
      const content = await testDatabaseHandler.makeDummyContent({
        type: ContentTypeEnum.SCHEDULE,
      });
      const savedContent = await repository.save(content);
      await expectEqualContent(content, savedContent);
    });

    it("system", async () => {
      const content = await testDatabaseHandler.makeDummyContent({
        type: ContentTypeEnum.SYSTEM,
      });
      const savedContent = await repository.save(content);
      await expectEqualContent(content, savedContent);
    });

    it("video", async () => {
      const content = await testDatabaseHandler.makeDummyContent({
        type: ContentTypeEnum.VIDEO,
      });
      const savedContent = await repository.save(content);
      await expectEqualContent(content, savedContent);
    });
  });

  describe("delete", () => {
    let targetContent: TypeormContent;
    let targetComments: TypeormComment[];
    let targetLikes: TypeormLike[];
    let targetReferred: TypeormContent[];

    beforeAll(async () => {
      const contentList = testDatabaseHandler.getDbCacheList(TypeormContent);
      for (const content of contentList.reverse()) {
        const comments = await content.comments;
        const likes = await content.likes;
        const referred = await content.referred;
        if (comments.length > 0 && likes.length > 0 && referred.length > 0) {
          targetContent = content;
          targetComments = comments;
          targetLikes = likes;
          targetReferred = referred;
          break;
        }
      }

      await repository.delete(targetContent.id);
    });

    it("target should be defined before delete", async () => {
      expect(targetContent).not.toBeNull();
      expect(targetComments).not.toBeNull();
      expect(targetLikes).not.toBeNull();
      expect(targetReferred).not.toBeNull();
    });

    it("should delete comment", async () => {
      await Promise.all(
        targetComments.map(async (target) => {
          const foundComment = await dataSource
            .getRepository(TypeormComment)
            .findOneBy({ id: target.id });
          expect(foundComment).toBeNull();
        }),
      );
    });

    it("should delete like", async () => {
      await Promise.all(
        targetLikes.map(async (target) => {
          const foundLike = await dataSource
            .getRepository(TypeormLike)
            .findOneBy({ id: target.id });
          expect(foundLike).toBeNull();
        }),
      );
    });

    it("should not delete referrenced content", async () => {
      await Promise.all(
        targetReferred.map(async (target) => {
          const foundContent = await dataSource
            .getRepository(TypeormContent)
            .findOneBy({ id: target.id });
          expect(foundContent).not.toBeNull();
        }),
      );
    });
  });
});

async function expectEqualContent(lhs: TypeormContent, rhs: TypeormContent) {
  expect(lhs.id).toEqual(rhs.id);
  expect(await lhs.group).toEqual(await rhs.group);
  expect(lhs.owner).toEqual(rhs.owner);
  expect(lhs.contentType).toEqual(rhs.contentType);

  expect(await lhs.referred).toStrictEqual(await rhs.referred);
  expect(lhs.thumbnailRelativePath).toStrictEqual(rhs.thumbnailRelativePath);

  expect(lhs.createdDateTime).toEqual(rhs.createdDateTime);
  expect(lhs.updatedDateTime).toEqual(rhs.updatedDateTime);
  expect(lhs.deletedDateTime).toEqual(rhs.deletedDateTime);

  switch (lhs.contentType) {
    case ContentTypeEnum.IMAGE:
    case ContentTypeEnum.VIDEO:
      expect((lhs as TypeormMedia).largeRelativePath).toBe(
        (rhs as TypeormMedia).largeRelativePath,
      );
      expect((lhs as TypeormMedia).originalRelativePath).toBe(
        (rhs as TypeormMedia).originalRelativePath,
      );
      expect((lhs as TypeormMedia).size).toBe((rhs as TypeormMedia).size);
      expect((lhs as TypeormMedia).ext).toBe((rhs as TypeormMedia).ext);
      expect((lhs as TypeormMedia).mimetype).toBe(
        (rhs as TypeormMedia).mimetype,
      );
      expect((await (lhs as TypeormMedia).referred).length).toBe(0);
      break;
    case ContentTypeEnum.POST:
      expect((lhs as TypeormPost).title).toBe((rhs as TypeormPost).title);
      expect((lhs as TypeormPost).text).toBe((rhs as TypeormPost).text);
      break;
    case ContentTypeEnum.SCHEDULE:
      expect((lhs as TypeormSchedule).title).toBe(
        (rhs as TypeormSchedule).title,
      );
      expect((lhs as TypeormSchedule).startDateTime).toEqual(
        (rhs as TypeormSchedule).startDateTime,
      );
      expect((lhs as TypeormSchedule).endDateTime).toEqual(
        (rhs as TypeormSchedule).endDateTime,
      );
      expect((lhs as TypeormSchedule).isAllDay).toEqual(
        (rhs as TypeormSchedule).isAllDay,
      );
      break;
    case ContentTypeEnum.BUCKET:
      expect((lhs as TypeormBucket).title).toBe((rhs as TypeormBucket).title);
      expect((lhs as TypeormBucket).status).toBe((rhs as TypeormBucket).status);
      break;
    case ContentTypeEnum.SYSTEM:
      expect((lhs as TypeormSystemContent).text).toBe(
        (rhs as TypeormSystemContent).text,
      );
      expect((lhs as TypeormSystemContent).subText).toBe(
        (rhs as TypeormSystemContent).subText,
      );
      break;
  }
}
