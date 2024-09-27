import { DummyDatabaseHandler } from "@test-utils/persistence/dummy-database-handler";
import { DataSource } from "typeorm";
import { TypeormGroup } from "../../src/infrastructure/persistence/typeorm/entity/group/typeorm-group.entity";
import { GroupId } from "@repo/be-core";
import { TypeormContent } from "../../src/infrastructure/persistence/typeorm/entity/content/typeorm-content.entity";
import { TypeormUser } from "../../src/infrastructure/persistence/typeorm/entity/user/typeorm-user.entity";
import assert from "assert";

export class GroupFixture {
  public dbHandler: DummyDatabaseHandler;

  constructor(private readonly dataSource: DataSource) {
    this.dbHandler = new DummyDatabaseHandler(dataSource);
  }

  async init(dbLoadPath: string) {
    await this.dbHandler.load(dbLoadPath);
  }

  async getGroupHavingMembersAndContents(): Promise<{
    group: TypeormGroup;
    owner: TypeormUser;
    members: TypeormUser[];
    contents: TypeormContent[];
  }> {
    let group: TypeormGroup | null = null;
    let owner: TypeormUser | null = null;
    let members: TypeormUser[] | null = null;
    let contents: TypeormContent[] | null = null;

    const groupList = this.dbHandler.getDbCacheList(TypeormGroup);
    for (const g of groupList) {
      const m = await g.members;
      const c = await this.getGroupContents(g.id);
      if (m.length > 0 && c.length > 0) {
        members = m;
        group = g;
        owner = await g.owner;
        contents = c;
        break;
      }
    }
    assert(!!group, "there is no group having contents");
    assert(!!owner, "there is no owner");
    assert(!!members, "there is no members");
    assert(!!contents, "there is no contents");
    return { group, owner, members, contents };
  }

  private getGroupContents(groupId: GroupId) {
    return this.dataSource
      .getRepository(TypeormContent)
      .createQueryBuilder("content")
      .where("content.groupId = :groupId", { groupId })
      .getMany();
  }
}
