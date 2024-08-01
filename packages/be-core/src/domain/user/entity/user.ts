import { IsString, IsUUID } from 'class-validator';
import { CreateUserEntityPayload } from './type/create-user-entity-payload';
import { v4 } from 'uuid';
import { EntityWithCUDTime } from '../../../common/entity/entity-with-cudtime';

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

  async deleteUser() {
    this._deletedDateTime = new Date();
    this.validate();
  }

  async changeUsername(username: string) {
    this._username = username;
    this._updatedDateTime = new Date();
    this.validate();
  }

  async changePassword(hashedPassword: string) {
    this._hashedPassword = hashedPassword;
    this._updatedDateTime = new Date();
    this.validate();
  }

  constructor(payload: CreateUserEntityPayload) {
    super();
    this._username = payload.username;
    this._hashedPassword = payload.hashedPassword;
    if ('id' in payload) {
      this._id = payload.id;
      this._createdDateTime = payload.createdDateTime;
      this._updatedDateTime = payload.updatedDateTime || null;
      this._deletedDateTime = payload.deletedDateTime || null;
    } else {
      this._id = v4();
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
