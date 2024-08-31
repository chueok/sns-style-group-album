import { IsOptional, IsString, IsUUID } from "class-validator";
import { CreateUserEntityPayload } from "./type/create-user-entity-payload";
import { v4 } from "uuid";
import { EntityWithCUDTime } from "../../../common/entity/entity-with-cudtime";
import { IPasswordEncryptionService } from "../../encryption/password-encryption-service.interface";
import { Exception } from "../../../common/exception/exception";
import { Code } from "../../../common/exception/code";
import { Nullable } from "src/common/type/common-types";

export class User extends EntityWithCUDTime<string> {
  @IsUUID()
  protected override _id: string;

  @IsString()
  private _username: string;
  get username(): string {
    return this._username;
  }

  @IsString()
  private _hashedPassword: string;
  get hashedPassword(): string {
    return this._hashedPassword;
  }

  @IsOptional()
  @IsString()
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

  async changePassword(
    oldPassword: string,
    newPassword: string,
    passwordEncryptionService: IPasswordEncryptionService,
  ): Promise<void> {
    const compareResult = await passwordEncryptionService.comparePassword(
      oldPassword,
      this._hashedPassword,
    );
    if (!compareResult) {
      throw Exception.new({ code: Code.CORE_BAD_PASSWORD_ERROR });
    }

    this._hashedPassword = await passwordEncryptionService.hash(newPassword);
    this._updatedDateTime = new Date();
    await this.validate();
  }

  constructor(payload: CreateUserEntityPayload<"constructor">) {
    super();
    this._username = payload.username;
    this._hashedPassword = payload.hashedPassword;
    this._thumbnailRelativePath = payload.thumbnailRelativePath;
    if ("id" in payload) {
      this._id = payload.id;
      this._createdDateTime = payload.createdDateTime;
      this._updatedDateTime = payload.updatedDateTime;
      this._deletedDateTime = payload.deletedDateTime;
    } else {
      this._id = v4();
      this._createdDateTime = new Date();
      this._updatedDateTime = null;
      this._deletedDateTime = null;
    }
  }

  static async new(payload: CreateUserEntityPayload<"all">) {
    // constructor 에서는 비동기 함수 호출이 불가하므로
    // 이곳에서 passwordEncryptionService 를 사용하여 password를 hasing 한다.

    // constructorPayload 에서는 hashedPassword를 가지도록 type 설계
    const constructorPayload =
      payload as CreateUserEntityPayload<"constructor">;
    if ("password" in constructorPayload && "password" in payload) {
      constructorPayload.hashedPassword =
        await payload.passwordEncryptionService.hash(
          constructorPayload.password,
        );
    }
    const entity = new User(constructorPayload);
    await entity.validate();
    return entity;
  }
}
