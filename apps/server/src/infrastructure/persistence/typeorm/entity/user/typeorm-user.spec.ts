import { Test, TestingModule } from "@nestjs/testing";
import { DataSource, Repository } from "typeorm";
import { TypeOrmModule } from "@nestjs/typeorm";

import { TypeormUser } from "./typeorm-user.entity";
import { join, basename } from "path";
import { DummyDatabaseHandler } from "@test-utils/persistence/dummy-database-handler";
import { typeormSqliteOptions } from "../../config/typeorm-config";

const parameters = {
  testDbPath: join("db", `${basename(__filename)}.sqlite`),
  dummyDbPath: join("db", "dummy.sqlite"),
};

describe("TypeormUser", () => {
  let module: TestingModule;
  let dataSource: DataSource;
  let repository: Repository<TypeormUser>;
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
    repository = dataSource.getRepository(TypeormUser);

    testDatabaseHandler = new DummyDatabaseHandler(dataSource);

    await testDatabaseHandler.load(parameters.dummyDbPath);
  });

  afterAll(async () => {
    await module.close();
  });

  describe("save", () => {
    it("should save normally", async () => {
      const user = testDatabaseHandler.makeDummyUser();
      await repository.save(user);

      const foundUser = await repository.findOneBy({ id: user.id });
      await expectEqualUser(foundUser!, user);
    });
  });

  describe("delete", () => {
    // delete 허용하지 않음
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
