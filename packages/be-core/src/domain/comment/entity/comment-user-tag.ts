import { IsNumber, IsUUID } from 'class-validator';
import { UserId } from '../../user/entity/type/user-id';
import { ValueObject } from '../../../common/value-object/value-object';

export class CommentUserTag extends ValueObject {
  @IsUUID('4')
  public readonly userId!: UserId;

  @IsNumber({ allowNaN: false, allowInfinity: false }, { each: true })
  public readonly at!: number[];

  constructor(payload: { userId: UserId; at: number[] }) {
    super();
    this.userId = payload.userId;
    this.at = payload.at;
  }

  public static async new(payload: {
    userId: UserId;
    at: number[];
  }): Promise<CommentUserTag> {
    return new CommentUserTag(payload);
  }
}
