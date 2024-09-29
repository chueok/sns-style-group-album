import {
  IsBoolean,
  IsEmail,
  IsInstance,
  IsOptional,
  IsString,
  IsUUID,
} from "class-validator";
import { CreateUserEntityPayload } from "./type/create-user-entity-payload";
import { v4 } from "uuid";
import { EntityWithCUDTime } from "../../../common/entity/entity-with-cudtime";
import { Nullable } from "../../../common/type/common-types";
import { UserId } from "./type/user-id";
import { GroupId } from "../../group/entity/type/group-id";
import { UserGroupProfile } from "./user-group-profile";
import { GroupInfo } from "./group-info";

export class User extends EntityWithCUDTime<UserId> {
  @IsUUID()
  protected override _id: UserId;

  @IsString()
  private _username: string;
  get username(): string {
    return this._username;
  }

  @IsOptional()
  @IsEmail()
  private _email: Nullable<string>;
  get email(): Nullable<string> {
    return this._email;
  }

  @IsBoolean()
  private _hasProfileImage: boolean;
  get hasProfile(): boolean {
    return this._hasProfileImage;
  }

  @IsString({ each: true })
  private _groups: GroupId[];
  get groups(): GroupId[] {
    return this._groups;
  }

  @IsString({ each: true })
  private _ownGroups: GroupId[];
  get ownGroups(): GroupId[] {
    return this._ownGroups;
  }

  @IsInstance(UserGroupProfile, { each: true })
  private _userGroupProfiles: UserGroupProfile[];
  get userGroupProfiles(): UserGroupProfile[] {
    return this._userGroupProfiles;
  }

  @IsUUID("all", { each: true })
  private _invitedGroupList: GroupInfo[];
  get invitedGroupList(): GroupInfo[] {
    return this._invitedGroupList;
  }

  async deleteUser(): Promise<boolean> {
    if (this.ownGroups.length !== 0) {
      return false;
    }

    this._deletedDateTime = new Date();
    await this.validate();
    return true;
  }

  async changeUsername(username: string): Promise<boolean> {
    if (this.username === username) {
      return false;
    }
    this._username = username;
    this._updatedDateTime = new Date();
    await this.validate();
    return true;
  }

  async changeUserGroupProfile(payload: {
    groupId: GroupId;
    nickname?: string;
    hasProfileImage?: boolean;
  }): Promise<boolean> {
    if (!this.groups.includes(payload.groupId)) {
      return false;
    }
    const userGroupProfile = this._userGroupProfiles.find(
      (profile) => profile.groupId === payload.groupId,
    );
    // user group profile이 없는 경우 생성
    if (!userGroupProfile) {
      const nickname = payload.nickname ? payload.nickname : this.username;
      const hasProfileImage = payload.hasProfileImage
        ? payload.hasProfileImage
        : false;
      this._userGroupProfiles.push(
        new UserGroupProfile({
          groupId: payload.groupId,
          nickname,
          hasProfileImage,
        }),
      );
      await this.validate();
      return true;
    }

    // user group profile이 있는 경우 수정
    if (payload.nickname) {
      userGroupProfile.nickname = payload.nickname;
    }
    if (payload.hasProfileImage) {
      userGroupProfile.hasProfileImage = payload.hasProfileImage;
    }
    await this.validate();
    return true;
  }

  constructor(payload: CreateUserEntityPayload<"all">) {
    super();
    this._username = payload.username;
    this._email = payload.email;
    if ("id" in payload) {
      this._id = payload.id;

      this._hasProfileImage = payload.hasProfileImage;

      this._groups = payload.groups;
      this._ownGroups = payload.ownGroups;
      this._userGroupProfiles = payload.userGroupProfiles;
      this._invitedGroupList = payload.invitedGroupList;

      this._createdDateTime = payload.createdDateTime;
      this._updatedDateTime = payload.updatedDateTime;
      this._deletedDateTime = payload.deletedDateTime;
    } else {
      this._id = v4() as UserId;

      this._hasProfileImage = false;

      this._groups = [];
      this._ownGroups = [];

      this._userGroupProfiles = [];
      this._invitedGroupList = [];

      this._createdDateTime = new Date();
      this._updatedDateTime = null;
      this._deletedDateTime = null;
    }
  }

  static async new(payload: CreateUserEntityPayload<"all">) {
    const entity = new User(payload);
    await entity.validate();
    return entity;
  }
}
