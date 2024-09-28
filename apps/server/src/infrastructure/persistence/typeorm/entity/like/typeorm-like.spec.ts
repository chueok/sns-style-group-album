import { Test, TestingModule } from "@nestjs/testing";
import { DataSource, Repository } from "typeorm";
import { join, basename } from "path";
import { TypeormLike } from "../like/typeorm-like.entity";
import { DummyDatabaseHandler } from "@test-utils/persistence/dummy-database-handler";
import {
  InfrastructureModule,
  typeormSqliteOptions,
} from "../../../../../di/infrastructure.module";

const parameters = {
  testDbPath: join("db", `${basename(__filename)}.sqlite`),
  dummyDbPath: join("db", "dummy.sqlite"),
};

describe("TypeormLike", () => {
  let module: TestingModule;
  let dataSource: DataSource;
  let repository: Repository<TypeormLike>;
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
    repository = dataSource.getRepository(TypeormLike);

    testDatabaseHandler = new DummyDatabaseHandler(dataSource);

    await testDatabaseHandler.load(parameters.dummyDbPath);
  });

  afterAll(async () => {
    await dataSource.destroy();
    await module.close();
  });

  it("should be defined", () => {
    expect(dataSource).toBeDefined();
    expect(repository).toBeDefined();
    expect(testDatabaseHandler).toBeDefined();
  });

  describe("save", () => {
    it("should save normally", async () => {
      const like = await testDatabaseHandler.makeDummyLike();
      const savedLike = await repository.save(like);
      await expectEqualLike(like, savedLike);
    });
  });

  describe("delete", () => {
    let target!: TypeormLike;
    beforeEach(async () => {
      target = await testDatabaseHandler.makeDummyLike();
      target = await repository.save(target);
    });

    it("should exist before delete", async () => {
      expect(target.id).not.toBeNull();
    });

    it("should delete normally", async () => {
      await repository.delete(target.id);

      const deletedLike = await repository.findOneBy({ id: target.id });

      expect(deletedLike).toBeNull();
    });
  });
});

async function expectEqualLike(
  like: TypeormLike,
  savedLike: TypeormLike,
): Promise<void> {
  expect(like.id).toBe(savedLike.id);
  expect((await like.content).id).toBe((await savedLike.content).id);
  expect((await like.user).id).toBe((await savedLike.user).id);
  expect(like.createdDateTime).toBe(savedLike.createdDateTime);
}
