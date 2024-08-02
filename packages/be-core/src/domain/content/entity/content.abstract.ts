import { IsArray, IsEnum, IsInstance, IsUUID } from 'class-validator';
import { EntityWithCUDTime } from '../../../common/entity/entity-with-cudtime';
import { ContentType } from '../enum/content-type';
import { ContentOwner } from './content-owner';
import { CreateContentEntityPayload } from './type/create-content-entity-payload';
import { v4 } from 'uuid';

export abstract class Content extends EntityWithCUDTime<string> {
  @IsUUID()
  protected override _id: string;

  @IsUUID()
  protected _groupId: string;
  get groupId(): string {
    return this._groupId;
  }

  @IsEnum(ContentType)
  protected _type!: ContentType;
  get type(): ContentType {
    return this._type;
  }

  @IsInstance(ContentOwner)
  protected _owner: ContentOwner;
  get owner(): ContentOwner {
    return this._owner;
  }

  @IsArray()
  protected _refered: Content[];
  get refered(): Content[] {
    return this._refered;
  }

  constructor(payload: CreateContentEntityPayload<'base', 'all'>) {
    super();

    this._groupId = payload.groupId;
    this._owner = payload.owner;
    this._refered = payload.refered;

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
}
