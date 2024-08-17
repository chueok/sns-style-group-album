import { Test, TestingModule } from "@nestjs/testing";
import { DataSource, Repository } from "typeorm";
import { TypeOrmModule } from "@nestjs/typeorm";
import { typeormSqliteOptions } from "../config/typeorm-config";
import { TypeormUser } from "./typeorm-user.entity";
import { TestDatabaseHandler } from "@test/utils/typeorm-utils";

describe("", () => {
  let module: TestingModule;
  let dataSource: DataSource;
  let repository: Repository<TypeormUser>;
  let testDatabaseHandler: TestDatabaseHandler;

  let targetItem: TypeormUser;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [TypeOrmModule.forRoot(typeormSqliteOptions)],
    }).compile();

    dataSource = module.get<DataSource>(DataSource);
    repository = dataSource.getRepository(TypeormUser);

    testDatabaseHandler = new TestDatabaseHandler(dataSource);
    await testDatabaseHandler.clearDatabase();

    await testDatabaseHandler.buildDummyData({
      numUser: 10,
      numGroup: 10,
      numContent: 10,
      numComment: 10,
    });
    targetItem = testDatabaseHandler.userList.at(-1) as TypeormUser;
    await testDatabaseHandler.commit();
    // targetItem = testDatabaseHandler.makeDummyUser();
    // await repository.save(targetItem);
    testDatabaseHandler.reset();
  });

  afterAll(async () => {
    await module.close();
  });

  it("shoud equal between what saved and what found", async () => {
    const foundItem = await repository.findOneBy({ id: targetItem.id });

    expect(foundItem?.id).toEqual(targetItem.id);
    expect(foundItem?.username).toEqual(targetItem.username);
    expect(foundItem?.hashedPassword).toEqual(targetItem.hashedPassword);
    expect(foundItem?.thumbnailRelativePath).toEqual(
      targetItem.thumbnailRelativePath,
    );

    expect(foundItem?.groups).not.toBeNull();
    expect(foundItem?.groups).toStrictEqual(targetItem.groups);

    expect(foundItem?.createdDateTime).toEqual(targetItem.createdDateTime);
    expect(foundItem?.updatedDateTime).toEqual(targetItem.updatedDateTime);
    expect(foundItem?.deletedDateTime).toEqual(targetItem.deletedDateTime);
  });

  it("should equal between what updated and what found", async () => {
    const updatedPath: string = "/updated-path";
    targetItem.thumbnailRelativePath = updatedPath;
    await repository.save(targetItem);

    const foundItem = await repository.findOneBy({ id: targetItem.id });

    expect(foundItem?.id).toEqual(targetItem.id);
    expect(foundItem?.username).toEqual(targetItem.username);
    expect(foundItem?.hashedPassword).toEqual(targetItem.hashedPassword);
    expect(foundItem?.thumbnailRelativePath).toEqual(updatedPath);

    expect(foundItem?.groups).not.toBeNull();
    expect(foundItem?.groups).toStrictEqual(targetItem.groups);

    expect(foundItem?.createdDateTime).toEqual(targetItem.createdDateTime);
    expect(foundItem?.updatedDateTime).toEqual(targetItem.updatedDateTime);
    expect(foundItem?.deletedDateTime).toEqual(targetItem.deletedDateTime);
  });

  it("should show null when property is null", async () => {
    const user = testDatabaseHandler.makeDummyUser();
    user.thumbnailRelativePath = null;

    await repository.save(user);
    const foundUser = await repository.findOneBy({ id: user.id });

    expect(foundUser?.thumbnailRelativePath).toBeNull();
  });

  it("should delete normaly", async () => {
    await repository.delete({ id: targetItem.id });

    const result = await repository.findOneBy({ id: targetItem.id });
    expect(result).toBeNull();
  });

  describe("should throw error when not-nullable property is null", () => {
    const itList: { property: string; nullable: boolean }[] = [
      { property: "id", nullable: false },
      { property: "username", nullable: false },
      { property: "hashedPassword", nullable: false },
      { property: "thumbnailRelativePath", nullable: true },
      { property: "createdDateTime", nullable: false },
      { property: "updatedDateTime", nullable: true },
      { property: "deletedDateTime", nullable: true },
    ];
    itList.forEach((item) => {
      it(`when ${item.property} is null`, async () => {
        const user = testDatabaseHandler.makeDummyUser();
        user[item.property] = null;
        if (item.nullable) {
          expect.assertions(0);
        } else {
          expect.hasAssertions();
        }
        try {
          await repository.save(user);
        } catch (error) {
          expect(error).toBeDefined();
        }
      });
    });
  });
});

/**
 * 1. test db를 미리 만들어 놓는다.
 *   1-1. 임시로 코드를 돌려 test db를 만들고 copy해서 쓴다.
 *   1-2. 별도 스크립트를 만든다.
 */
