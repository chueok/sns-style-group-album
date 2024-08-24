import { Test, TestingModule } from "@nestjs/testing";
import { DataSource, Repository } from "typeorm";
import { TypeOrmModule } from "@nestjs/typeorm";
import { typeormSqliteOptions } from "../config/typeorm-config";
import { join } from "path";
import {
  TypeormBucket,
  TypeormContent,
  TypeormMedia,
  TypeormPost,
  TypeormSchedule,
  TypeormSystemContent,
} from "./typeorm-content.entity";
import { ContentTypeEnum } from "@repo/be-core";
import { DummyDatabaseHandler } from "@test/utils/dummy-database-handler";

const parameters = {
  testDbPath: join("db", "TypeormContent.sqlite"),
  dummyDbPath: join("db", "dummy.sqlite"),
};

describe("TypeormContent", () => {
  let module: TestingModule;
  let dataSource: DataSource;
  let repository: Repository<TypeormContent>;
  let testDatabaseHandler: DummyDatabaseHandler;

  let targetItem: TypeormContent;

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
    targetItem = testDatabaseHandler.getDbCacheList(TypeormContent).at(-1)!;
  });

  afterAll(async () => {
    await module.close();
  });

  it("shoud equal between what saved and what found", async () => {
    const foundItem = await repository.findOneBy({ id: targetItem.id });

    await expectEqualContent(foundItem!, targetItem);
  });

  it("should equal between what updated and what found", async () => {
    const updatedPath: string = "/updated-path";
    targetItem.thumbnailRelativePath = updatedPath;
    await repository.save(targetItem);

    const foundItem = await repository.findOneBy({ id: targetItem.id });

    await expectEqualContent(foundItem!, targetItem);
  });

  it("should show null when property is null", async () => {
    const content = testDatabaseHandler.makeDummyContent();
    content.thumbnailRelativePath = null;

    await repository.save(content);
    const foundUser = await repository.findOneBy({ id: content.id });

    expect(foundUser?.thumbnailRelativePath).toBeNull();
  });

  it("should delete normaly", async () => {
    await repository.delete({ id: targetItem.id });

    const result = await repository.findOneBy({ id: targetItem.id });
    expect(result).toBeNull();
  });

  // TODO : delete / null 평가 이후 테스트 시 cache 가 더렵혀짐. 해당 부분 해결 필요
  // TODO : type 별 null 테스트 필요.
  describe("should throw error when not-nullable property is null", () => {
    beforeEach(async () => {
      await testDatabaseHandler.loadDbCache();
    });
    const itList: { property: string; nullable: boolean }[] = [
      { property: "id", nullable: false },
      { property: "group", nullable: false },
      { property: "owner", nullable: true },
      // type property는 default 값이 있어서 null이어도 에러 발생하지 않음.
      // { property: "type", nullable: false },
      // { property: "referred", nullable: false },
      { property: "thumbnailRelativePath", nullable: true },
      { property: "createdDateTime", nullable: false },
      { property: "updatedDateTime", nullable: true },
      { property: "deletedDateTime", nullable: true },
    ];
    itList.forEach((item) => {
      describe(`when ${item.property} is null`, () => {
        it(`when ${item.property} is null`, async () => {
          const content = testDatabaseHandler.makeDummyContent();
          content[item.property] = null;
          if (item.nullable) {
            expect.assertions(0);
          } else {
            expect.hasAssertions();
          }
          try {
            // const repository =
            //   TypeormContentRepositoryMapper.fromContentToRepository(
            //     dataSource,
            //     content,
            //   );
            // await repository.save(content);
            await repository.save(content);
            item.property === "type" && console.log(content);
          } catch (error) {
            expect(error).toBeDefined();
          }
        });
      });
    });
  });
});

async function expectEqualContent(lhs: TypeormContent, rhs: TypeormContent) {
  expect(lhs.id).toEqual(rhs.id);
  expect(await lhs.group).toEqual(await rhs.group);
  expect(lhs.owner).toEqual(rhs.owner);
  expect(lhs.type).toEqual(rhs.type);

  expect(await lhs.referred).toStrictEqual(await rhs.referred);
  expect(lhs.thumbnailRelativePath).toStrictEqual(rhs.thumbnailRelativePath);

  expect(lhs.createdDateTime).toEqual(rhs.createdDateTime);
  expect(lhs.updatedDateTime).toEqual(rhs.updatedDateTime);
  expect(lhs.deletedDateTime).toEqual(rhs.deletedDateTime);

  switch (lhs.type) {
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
