import { DummyDatabaseHandler } from "@test-utils/persistence/dummy-database-handler";
import { DataSource } from "typeorm";
import assert from "assert";
import { TypeormUser } from "../../src/infrastructure/persistence/typeorm/entity/user/typeorm-user.entity";

export class UserFixture {
  private readonly dbHandler: DummyDatabaseHandler;

  constructor(private readonly dataSource: DataSource) {
    this.dbHandler = new DummyDatabaseHandler(dataSource);
  }

  async init(dbLoadPath: string) {
    await this.dbHandler.load(dbLoadPath);
  }

  async getAnyUser(): Promise<TypeormUser> {
    const user = this.dbHandler.getDbCacheList(TypeormUser).at(0);
    assert(!!user, "user list is empty");
    return user;
  }
}
