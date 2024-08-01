import { IsDate, IsString } from 'class-validator';
import { Entity } from '../../../common/entity/entity';
import { Nullable } from '../../../common/type/common-types';
import { CreateUserEntityPayload } from './type/create-user-entity-payload';
import { v4 } from 'uuid';
import { IPasswordEncryptionService } from '../../../infrastructure/security/encryption/password-encryption-service.interface';

export class User extends Entity<string> {
  @IsString()
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

  @IsDate()
  private _createdDateTime: Date;
  get createdDateTime(): Date {
    return this._createdDateTime;
  }

  @IsDate()
  private _updatedDateTime: Nullable<Date>;
  get updatedDateTime(): Nullable<Date> {
    return this._updatedDateTime;
  }

  @IsDate()
  private _deletedDateTime: Nullable<Date>;
  get deletedDateTime(): Nullable<Date> {
    return this._deletedDateTime;
  }

  async deleteUser() {
    this._deletedDateTime = new Date();
    this.validate();
  }

  async changeUsername(username: string) {
    this._username = username;
    this._updatedDateTime = new Date();
    this.validate();
  }

  async changePassword(
    password: string,
    passwordEncryptionService: IPasswordEncryptionService
  ) {
    this._hashedPassword = await passwordEncryptionService.hash(password);
    this._updatedDateTime = new Date();
    this.validate();
  }

  constructor(payload: CreateUserEntityPayload) {
    super();
    if ('id' in payload) {
      this._id = payload.id;
      this._username = payload.username;
      this._hashedPassword = payload.password;
      this._createdDateTime = payload.createdDateTime;
      this._updatedDateTime = payload.updatedDateTime || null;
      this._deletedDateTime = payload.deletedDateTime || null;
    } else {
      this._id = v4();
      this._username = payload.username;
      this._hashedPassword = payload.password;
      this._createdDateTime = new Date();
      this._updatedDateTime = null;
      this._deletedDateTime = null;
    }
  }

  static async new(payload: CreateUserEntityPayload) {
    const entity = new User(payload);
    entity.validate();
    return entity;
  }
}
