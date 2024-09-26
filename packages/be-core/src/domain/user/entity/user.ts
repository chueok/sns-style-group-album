import { IsEmail, IsOptional, IsString, IsUrl, IsUUID } from "class-validator";
import { CreateUserEntityPayload } from "./type/create-user-entity-payload";
import { v4 } from "uuid";
import { EntityWithCUDTime } from "../../../common/entity/entity-with-cudtime";
import { Nullable } from "../../../common/type/common-types";
import { UserId } from "./type/user-id";
import { GroupId } from "../../group/entity/type/group-id";

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
  // TODO : presignedUrl로 바꿔줘야 하는데, 그 책임을 어디에 둬야 할까?
  // 1. User 2. 별도 use case
  // 1의 경우 개발 미스로 url 변경 후 db저장을 하게 될까 우려 됨.
  // 2의 경우는 그렇다고 막을 수 있나?
  // dto로 전환 시 수행 해야 함
  // entity에 어떤 것이 변환 되어야 하는지 명시 후, dto에서 변환
  private _thumbnailRelativePath: Nullable<string>;
  get thumbnailRelativePath(): Nullable<string> {
    return this._thumbnailRelativePath;
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

      this._groups = payload.groups;
      this._ownGroups = payload.ownGroups;

      this._createdDateTime = payload.createdDateTime;
      this._updatedDateTime = payload.updatedDateTime;
      this._deletedDateTime = payload.deletedDateTime;
    } else {
      this._id = v4() as UserId;

      this._groups = [];
      this._ownGroups = [];

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
