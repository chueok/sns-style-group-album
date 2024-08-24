import { Test, TestingModule } from "@nestjs/testing";
import { DataSource, Repository } from "typeorm";
import { TypeOrmModule } from "@nestjs/typeorm";
import { typeormSqliteOptions } from "../config/typeorm-config";
import { TypeormUser } from "./typeorm-user.entity";
import { join } from "path";
import { DummyDatabaseHandler } from "@test/utils/dummy-database-handler";

const parameters = {
  testDbPath: join("db", "TypeormUser.sqlite"),
  dummyDbPath: join("db", "dummy.sqlite"),
};

describe("TypeormUser", () => {
  let module: TestingModule;
  let dataSource: DataSource;
  let repository: Repository<TypeormUser>;
  let testDatabaseHandler: DummyDatabaseHandler;

  let targetItem: TypeormUser;

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
    repository = dataSource.getRepository(TypeormUser);

    testDatabaseHandler = new DummyDatabaseHandler(dataSource);

    await testDatabaseHandler.load(parameters.dummyDbPath);
    targetItem = testDatabaseHandler.getDbCacheList(TypeormUser).at(-1)!;
  });

  afterAll(async () => {
    await module.close();
  });

  it("shoud equal between what saved and what found", async () => {
    const foundItem = await repository.findOneBy({ id: targetItem.id });

    await expectEqualUser(foundItem!, targetItem);
  });

  it("should equal between what updated and what found", async () => {
    const updatedPath: string = "/updated-path";
    targetItem.thumbnailRelativePath = updatedPath;
    await repository.save(targetItem);

    const foundItem = await repository.findOneBy({ id: targetItem.id });

    await expectEqualUser(foundItem!, targetItem);
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

async function expectEqualUser(lhs: TypeormUser, rhs: TypeormUser) {
  expect(lhs.id).toEqual(rhs.id);
  expect(lhs.username).toEqual(rhs.username);
  expect(lhs.hashedPassword).toEqual(rhs.hashedPassword);
  expect(lhs.thumbnailRelativePath).toEqual(rhs.thumbnailRelativePath);

  expect(await lhs.groups).toStrictEqual(await rhs.groups);

  expect(lhs.createdDateTime).toEqual(rhs.createdDateTime);
  expect(lhs.updatedDateTime).toEqual(rhs.updatedDateTime);
  expect(lhs.deletedDateTime).toEqual(rhs.deletedDateTime);
}
