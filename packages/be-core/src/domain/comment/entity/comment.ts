import { Nullable } from '../../../common/type/common-types';
import { CreateCommentEntityPayload } from '../type/create-comment-entity-payload';
import { Comment } from './comment.abstract';
import { IsOptional, IsString, IsUUID } from 'class-validator';
import { ECommentCategory } from '../enum/comment-category';
import { UserId } from '../../user/type/user-id';
import { z } from 'zod';

export const SComment = z.object({
  id: z.string(),
  category: z.nativeEnum(ECommentCategory),
  text: z.string(),
  userTags: z.array(z.string()),
  contentId: z.string(),
  ownerId: z.string().nullable(),
  subText: z.string().nullable(),
  createdDateTime: z.date(),
  updatedDateTime: z.date().nullable(),
  deletedDateTime: z.date().nullable(),
});

export type TComment = z.infer<typeof SComment>;

export class UserComment extends Comment {
  @IsUUID('all')
  protected _ownerId: UserId;
  get ownerId(): UserId {
    return this._ownerId;
  }

  constructor(payload: CreateCommentEntityPayload<'user', 'all'>) {
    super(payload);
    this._type = ECommentCategory.USER_COMMENT;
    this._ownerId = payload.ownerId;
  }

  static async new(
    payload: CreateCommentEntityPayload<'user', 'all'>
  ): Promise<UserComment> {
    const entity = new UserComment(payload);
    await entity.validate();
    return entity;
  }
}

export class SystemComment extends Comment {
  @IsOptional()
  @IsString()
  protected _subText: Nullable<string>;
  get subText(): Nullable<string> {
    return this._subText;
  }

  constructor(payload: CreateCommentEntityPayload<'system', 'all'>) {
    super(payload);
    this._type = ECommentCategory.SYSTEM_COMMENT;
    this._subText = payload.subText;
  }

  static async new(
    payload: CreateCommentEntityPayload<'system', 'all'>
  ): Promise<SystemComment> {
    const entity = new SystemComment(payload);
    await entity.validate();
    return entity;
  }
}
