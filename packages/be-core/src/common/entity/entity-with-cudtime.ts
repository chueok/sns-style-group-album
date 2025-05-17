import { IsDate, IsOptional } from 'class-validator';
import { Nullable } from '../type/common-types';
import { Entity } from './entity';

export abstract class EntityWithCUDTime<
  TIdentifier extends string | number,
> extends Entity<TIdentifier> {
  @IsDate()
  protected _createdDateTime!: Date;
  get createdDateTime(): Date {
    return this._createdDateTime;
  }

  @IsOptional()
  @IsDate()
  protected _updatedDateTime!: Nullable<Date>;
  get updatedDateTime(): Nullable<Date> {
    return this._updatedDateTime;
  }

  @IsOptional()
  @IsDate()
  protected _deletedDateTime!: Nullable<Date>;
  get deletedDateTime(): Nullable<Date> {
    return this._deletedDateTime;
  }
}
