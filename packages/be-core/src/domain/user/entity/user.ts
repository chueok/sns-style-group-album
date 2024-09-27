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

  async deleteUser(): Promise<void> {
    this._deletedDateTime = new Date();
    await this.validate();
  }

  async changeUsername(username: string): Promise<void> {
    this._username = username;
    this._updatedDateTime = new Date();
    await this.validate();
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

      this._createdDateTime = payload.createdDateTime;
      this._updatedDateTime = payload.updatedDateTime;
      this._deletedDateTime = payload.deletedDateTime;
    } else {
      this._id = v4() as UserId;

      this._hasProfileImage = false;

      this._groups = [];
      this._ownGroups = [];

      this._userGroupProfiles = [];

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
