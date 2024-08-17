import { Test, TestingModule } from "@nestjs/testing";
import { TypeormComment } from "./typeorm-comment.entity";
import { TypeOrmModule } from "@nestjs/typeorm";
import { typeormSqliteOptions } from "../config/typeorm-config";
import { DataSource, Repository } from "typeorm";

describe("TypeormComment", () => {
  let module: TestingModule;
  let repository: Repository<TypeormComment>;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [TypeOrmModule.forRoot(typeormSqliteOptions)],
    }).compile();

    const dataSource = module.get<DataSource>(DataSource);
    repository = dataSource.getRepository(TypeormComment);
  });

  afterAll(async () => {
    await module.close();
  });
  it("should be defined", () => {
    expect(repository).toBeDefined();
  });

  it("should create a user comment", async () => {
    expect(repository).toBeDefined();
  });
});
