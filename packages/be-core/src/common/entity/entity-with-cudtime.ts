import { IsDate } from 'class-validator';
import { Nullable } from '../type/common-types';
import { Entity } from './entity';

export abstract class EntityWithCUDTime<
  TIdentifier extends string | number,
> extends Entity<TIdentifier> {
  @IsDate()
  protected _createdDateTime!: Date;
  get createdDateTime(): Nullable<Date> {
    return this._createdDateTime;
  }

  @IsDate()
  protected _updatedDateTime!: Nullable<Date>;
  get updatedDateTime(): Nullable<Date> {
    return this._updatedDateTime;
  }

  @IsDate()
  protected _deletedDateTime!: Nullable<Date>;
  get deletedDateTime(): Nullable<Date> {
    return this._deletedDateTime;
  }
}
