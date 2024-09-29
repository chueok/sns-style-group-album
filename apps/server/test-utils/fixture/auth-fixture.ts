import { DummyDatabaseHandler } from "@test-utils/persistence/dummy-database-handler";
import { DataSource } from "typeorm";
import { IAuthService } from "../../src/http-rest/auth/auth-service.interface";
import { TypeormGroup } from "../../src/infrastructure/persistence/typeorm/entity/group/typeorm-group.entity";
import assert from "assert";
import { TypeormUser } from "../../src/infrastructure/persistence/typeorm/entity/user/typeorm-user.entity";
import { JwtService } from "@nestjs/jwt";
import { JwtUserPayload } from "../../src/http-rest/auth/type/jwt-user-payload";
import { v4 } from "uuid";

export class AuthFixture {
  private readonly dbHandler: DummyDatabaseHandler;

  constructor(
    private readonly dataSource: DataSource,
    private readonly authService: IAuthService,
    private readonly jwtService?: JwtService,
  ) {
    this.dbHandler = new DummyDatabaseHandler(dataSource);
  }

  async init(dbLoadPath: string) {
    await this.dbHandler.load(dbLoadPath);
  }

  public async get_validUser_accessToken(): Promise<{
    user: TypeormUser;
    accessToken: string;
  }> {
    const user = this.dbHandler
      .getDbCacheList(TypeormUser)
      .filter((user) => !user.deletedDateTime)
      .at(0);
    assert(!!user, "there is no valid user");

    const loginToken = await this.authService.getLoginToken({
      id: user.id,
    });
    return { user, accessToken: loginToken.accessToken };
  }

  public async get_deletedUser_accessToken(): Promise<{
    user: TypeormUser;
    accessToken: string;
  }> {
    const user = this.dbHandler
      .getDbCacheList(TypeormUser)
      .filter((user) => user.deletedDateTime !== null)
      .at(0);
    assert(!!user, "there is no deleted user");

    const loginToken = await this.authService.getLoginToken({
      id: user.id,
    });
    return { user, accessToken: loginToken.accessToken };
  }

  public async get_invalidAccessToken_validUser_invalidScretKey(): Promise<{
    accessToken: string;
    user: TypeormUser;
  }> {
    assert(!!this.jwtService, "jwtService is not exist");

    const validUser = this.dbHandler
      .getDbCacheList(TypeormUser)
      .filter((user) => user.deletedDateTime === null)
      .at(0);
    assert(!!validUser, "user list is empty");

    const payload: JwtUserPayload = {
      id: validUser.id,
    };
    const accessToken = this.jwtService.sign(payload, {
      secret: "fake-scret-asdjkfhlb",
    });
    return {
      accessToken,
      user: validUser,
    };
  }

  public async get_invalidAccessToken_invalidUser_validScretKey(): Promise<{
    accessToken: string;
    payload: JwtUserPayload;
  }> {
    assert(!!this.jwtService, "jwtService is not exist");

    const payload: JwtUserPayload = {
      id: v4(),
    };
    const accessToken = this.jwtService.sign(payload);

    return {
      accessToken,
      payload,
    };
  }

  public async get_group_member_accessToken(): Promise<{
    accessToken: string;
    user: TypeormUser;
    group: TypeormGroup;
  }> {
    const groupList = this.dbHandler.getDbCacheList(TypeormGroup);

    let targetGroup: TypeormGroup | null = null;
    for (const group of groupList) {
      if (group.deletedDateTime) {
        continue;
      }
      if ((await group.members).length > 1) {
        targetGroup = group;
      }
    }
    assert(targetGroup, "group not found");

    const user = (await targetGroup.members)
      .filter((member) => {
        return member.id !== targetGroup.ownerId && !member.deletedDateTime;
      })
      .at(0);
    assert(user && !user.deletedDateTime, "user not found");

    const loginToken = await this.authService.getLoginToken({
      id: user.id,
    });

    return {
      accessToken: loginToken.accessToken,
      user,
      group: targetGroup,
    };
  }

  public async get_group_owner_accessToken(): Promise<{
    accessToken: string;
    user: TypeormUser;
    group: TypeormGroup;
  }> {
    const groupList = this.dbHandler.getDbCacheList(TypeormGroup);
    const group = groupList.filter((group) => !group.deletedDateTime).at(0);
    assert(group && !group.deletedDateTime, "group not found");
    const user = await group.owner;
    assert(user && !user.deletedDateTime, "user not found");

    const loginToken = await this.authService.getLoginToken({
      id: user.id,
    });

    return {
      accessToken: loginToken.accessToken,
      user,
      group,
    };
  }

  public async getGroupUserNotIn(userId: string): Promise<TypeormGroup> {
    // 빈 그룹 생성
    const unrelatedUser = this.dbHandler
      .getDbCacheList(TypeormUser)
      .filter((user) => user.id !== userId)
      .at(0);
    assert(!!unrelatedUser, "unrelatedUser is not exist");

    const newGroup = this.dbHandler.makeDummyGroup();
    newGroup.members = Promise.resolve([unrelatedUser]);
    newGroup.ownerId = unrelatedUser.id;
    await this.dbHandler.commit();

    const targetGroup = this.dbHandler
      .getDbCacheList(TypeormGroup)
      .filter((group) => group.id === newGroup.id)[0];

    assert(!!targetGroup, `${userId} is exist in all groups`);
    return targetGroup;
  }

  public async getUsersNotInGroup(groupId: string): Promise<TypeormUser[]> {
    const group = this.dbHandler
      .getDbCacheList(TypeormGroup)
      .filter((group) => group.id === groupId)
      .at(0);
    assert(!!group, "group not found");

    const users = this.dbHandler.getDbCacheList(TypeormUser);
    const members = await group.members;
    const usersNotInGroup = users.filter(
      (user) => !members.find((member) => member.id === user.id),
    );
    return usersNotInGroup;
  }
}
