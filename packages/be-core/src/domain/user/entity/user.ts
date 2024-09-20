import { IsEmail, IsOptional, IsString, IsUrl, IsUUID } from "class-validator";
import { CreateUserEntityPayload } from "./type/create-user-entity-payload";
import { v4 } from "uuid";
import { EntityWithCUDTime } from "../../../common/entity/entity-with-cudtime";
import { Nullable } from "../../../common/type/common-types";
import { UserId } from "./type/user-id";

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

  @IsOptional()
  @IsUrl()
  private _thumbnailRelativePath: Nullable<string>;
  get thumbnailRelativePath(): Nullable<string> {
    return this._thumbnailRelativePath;
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
    this._thumbnailRelativePath = payload.thumbnailRelativePath;
    if ("id" in payload) {
      this._id = payload.id;
      this._createdDateTime = payload.createdDateTime;
      this._updatedDateTime = payload.updatedDateTime;
      this._deletedDateTime = payload.deletedDateTime;
    } else {
      this._id = v4() as UserId;
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
