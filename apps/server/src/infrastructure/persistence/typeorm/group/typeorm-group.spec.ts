import { Test, TestingModule } from "@nestjs/testing";
import { join } from "path";
import { DataSource, Repository } from "typeorm";
import { TypeormGroup } from "./typeorm-group.entity";
import { TestDatabaseHandler } from "@test/utils/typeorm-utils";
import { TypeOrmModule } from "@nestjs/typeorm";
import { typeormSqliteOptions } from "../config/typeorm-config";

const parameters = {
  testDbPath: join("db", "TypeormGroup.sqlite"),
  dummyDbPath: join("db", "dummy.sqlite"),
};

describe("TypeormGroup", () => {
  let module: TestingModule;
  let dataSource: DataSource;
  let repository: Repository<TypeormGroup>;
  let testDatabaseHandler: TestDatabaseHandler;

  let targetItem: TypeormGroup;

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
    repository = dataSource.getRepository(TypeormGroup);

    testDatabaseHandler = new TestDatabaseHandler(dataSource);

    await testDatabaseHandler.load(parameters.dummyDbPath);
    targetItem = testDatabaseHandler.getListMap(TypeormGroup).at(-1)!;
  });

  afterAll(async () => {
    await module.close();
  });

  it("shoud equal between what saved and what found", async () => {
    const foundItem = (await repository.findOneBy({ id: targetItem.id }))!;

    await expectEqualGroup(targetItem, foundItem);
  });

  it("should equal between what updated and what found", async () => {
    const updatedName: string = "new name";
    targetItem.name = updatedName;
    await repository.save(targetItem);

    const foundItem = (await repository.findOneBy({ id: targetItem.id }))!;

    await expectEqualGroup(targetItem, foundItem);
  });

  it("should show null when property is null", async () => {
    const group = testDatabaseHandler.makeDummyGroup();
    group.owner = Promise.resolve(null);

    await repository.save(group);
    const foundGroup = (await repository.findOneBy({ id: group.id }))!;

    expect(await foundGroup.owner).toBeNull();
  });

  it("should delete normaly", async () => {
    await repository.delete({ id: targetItem.id });

    const result = await repository.findOneBy({ id: targetItem.id });
    expect(result).toBeNull();
  });

  describe("should throw error when not-nullable property is null", () => {
    const itList: { property: string; nullable: boolean }[] = [
      { property: "id", nullable: false },
      { property: "name", nullable: false },
      // { property: "members", nullable: false }, // ManyToMany relation 에서는 nullable 제약이 의미 없음.
      { property: "owner", nullable: true },
      { property: "createdDateTime", nullable: false },
      { property: "updatedDateTime", nullable: true },
      { property: "deletedDateTime", nullable: true },
    ];
    itList.forEach((item) => {
      it(`when ${item.property} is null`, async () => {
        const group = testDatabaseHandler.makeDummyGroup();
        group[item.property] = null;
        if (item.nullable) {
          expect.assertions(0);
        } else {
          expect.hasAssertions();
        }
        try {
          await repository.save(group);
        } catch (error) {
          expect(error).toBeDefined();
        }
      });
    });
  });
});

async function expectEqualGroup(lhs: TypeormGroup, rhs: TypeormGroup) {
  expect(lhs.id).toEqual(rhs.id);
  expect(lhs.name).toEqual(rhs.name);
  expect(await lhs.members).toEqual(await rhs.members);
  expect(await lhs.owner).toEqual(await rhs.owner);

  expect(lhs.createdDateTime).toEqual(rhs.createdDateTime);
  expect(lhs.updatedDateTime).toEqual(rhs.updatedDateTime);
  expect(lhs.deletedDateTime).toEqual(rhs.deletedDateTime);
}
