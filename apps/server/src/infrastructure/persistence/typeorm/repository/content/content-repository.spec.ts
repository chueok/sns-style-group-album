import { join, basename } from "path";
import { DataSource } from "typeorm";
import { typeormSqliteOptions } from "../../config/typeorm-config";
import { DummyDatabaseHandler } from "@test-utils/persistence/dummy-database-handler";
import { TypeormContentRepository } from "./content-repository";
import { TypeormContent } from "../../entity/content/typeorm-content.entity";
import { TypeormUser } from "../../entity/user/typeorm-user.entity";
import { TypeormGroup } from "../../entity/group/typeorm-group.entity";
import { ContentTypeEnum } from "@repo/be-core";

const parameters = {
  testDbPath: join("db", `${basename(__filename)}.sqlite`),
  dummyDbPath: join("db", "dummy.sqlite"),
};

describe("ContentRepository", () => {
  let dataSource: DataSource;
  let testDatabaseHandler: DummyDatabaseHandler;
  let contentRepository: TypeormContentRepository;

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

    contentRepository = new TypeormContentRepository(dataSource);
  });

  afterAll(async () => {
    await dataSource.destroy();
  });

  it("should be defined", () => {
    expect(dataSource).toBeDefined();
    expect(testDatabaseHandler).toBeDefined();
  });

  describe("findContentById", () => {
    let targetOrmContent: TypeormContent;
    beforeAll(async () => {
      targetOrmContent = testDatabaseHandler
        .getDbCacheList(TypeormContent)
        .at(-1)!;
    });

    it("should find a content by id", async () => {
      const content = await contentRepository.findContentById(
        targetOrmContent.id,
      );

      expect(content).not.toBeNull();
      expect(content!.id).toEqual(targetOrmContent.id);
      expect(content?.referred.length).toEqual(
        (await targetOrmContent.referred).length,
      );
      expect(content?.numLikes).toEqual((await targetOrmContent.likes).length);
      expect(content?.likeList.length).toBeLessThanOrEqual(
        TypeormContentRepository.likeLimit,
      );

      expect(content?.numComments).toEqual(
        (await targetOrmContent.comments).length,
      );
      expect(content?.commentList.length).toBeLessThanOrEqual(
        TypeormContentRepository.commentLimit,
      );
    });
  });

  describe("findContentsByGroupIdAndType", () => {
    let targetOrmGroup: TypeormGroup;
    beforeAll(async () => {
      targetOrmGroup = testDatabaseHandler.getDbCacheList(TypeormGroup).at(-1)!;
    });

    function getMiddleElement<T>(arr: T[]): T | null {
      if (arr.length === 0) return null;
      const middleIndex = Math.floor(arr.length / 2);
      return arr[middleIndex] || null;
    }

    it("(asc) should find a content list by group id and type", async () => {
      const targetContentList = testDatabaseHandler
        .getDbCacheList(TypeormContent)
        .filter((content) => content.groupId === targetOrmGroup.id)
        .sort(
          (a, b) => b.createdDateTime.getTime() - a.createdDateTime.getTime(),
        );

      const cursor = getMiddleElement(targetContentList)!.createdDateTime;

      const contentList = await contentRepository.findContentsByGroupIdAndType({
        groupId: targetOrmGroup.id,
        contentType: ContentTypeEnum.POST,
        pagination: {
          cursor,
          by: "createdDateTime",
          direction: "asc",
          limit: 10,
        },
      });

      const numContents = testDatabaseHandler
        .getDbCacheList(TypeormContent)
        .filter(
          (content) =>
            content.groupId === targetOrmGroup.id &&
            content.contentType === ContentTypeEnum.POST &&
            content.createdDateTime.getTime() > cursor.getTime(),
        ).length;

      expect(contentList).not.toBeNull();
      expect(contentList).toBeInstanceOf(Array);
      expect(contentList.length).toBeLessThanOrEqual(10);
      expect(contentList.length).toEqual(numContents);
    });
    it("(desc) should find a content list by group id and type", async () => {
      const targetContentList = testDatabaseHandler
        .getDbCacheList(TypeormContent)
        .filter((content) => content.groupId === targetOrmGroup.id)
        .sort(
          (a, b) => a.createdDateTime.getTime() - b.createdDateTime.getTime(),
        );

      const cursor = getMiddleElement(targetContentList)!.createdDateTime;

      const contentList = await contentRepository.findContentsByGroupIdAndType({
        groupId: targetOrmGroup.id,
        contentType: ContentTypeEnum.POST,
        pagination: {
          cursor,
          by: "createdDateTime",
          direction: "desc",
          limit: 10,
        },
      });

      const filterFromCache = testDatabaseHandler
        .getDbCacheList(TypeormContent)
        .filter(
          (content) =>
            content.groupId === targetOrmGroup.id &&
            content.contentType === ContentTypeEnum.POST &&
            content.createdDateTime.getTime() < cursor.getTime(),
        );

      expect(contentList).not.toBeNull();
      expect(contentList).toBeInstanceOf(Array);
      expect(contentList.length).toBeLessThanOrEqual(10);
      expect(contentList.length).toEqual(filterFromCache.length);
    });
  });

  describe("findContentsByGroupMember", () => {
    let targetOrmUser: TypeormUser;
    let targetGroup: TypeormGroup;
    beforeAll(async () => {
      targetOrmUser = testDatabaseHandler.getDbCacheList(TypeormUser).at(-1)!;
      targetGroup = (await targetOrmUser.groups).at(-1)!;
    });

    it("should be defined", () => {
      expect(targetOrmUser).toBeDefined();
      expect(targetGroup).toBeDefined();
    });

    it("should find a content list by owner id", async () => {
      const contentList = await contentRepository.findContentsByGroupMember({
        userId: targetOrmUser.id,
        groupId: targetGroup.id,
      });

      const numContnets = testDatabaseHandler
        .getDbCacheList(TypeormContent)
        .filter(
          (content) =>
            content.ownerId === targetOrmUser.id &&
            content.groupId === targetGroup.id,
        ).length;

      expect(contentList).not.toBeNull();
      expect(contentList).toBeInstanceOf(Array);
      expect(contentList.length).toEqual(numContnets);
    });
  });
});
