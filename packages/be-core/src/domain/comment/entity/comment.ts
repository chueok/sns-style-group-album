import { Nullable, Optional } from "../../../common/type/common-types";
import { CommentOwner } from "./comment-owner";
import { CreateCommentEntityPayload } from "./type/create-comment-entity-payload";
import { Comment } from "./comment.abstract";
import { IsInstance, IsOptional, IsString } from "class-validator";
import { CommentTypeEnum } from "../enum/comment-type-enum";

export class UserComment extends Comment {
  @IsInstance(CommentOwner)
  protected _owner: CommentOwner;
  get owner(): CommentOwner {
    return this._owner;
  }

  @IsOptional()
  @IsInstance(CommentOwner, { each: true })
  protected _tags: Optional<CommentOwner[]>;
  get tags(): Optional<CommentOwner[]> {
    return this._tags;
  }

  constructor(payload: CreateCommentEntityPayload<"user", "all">) {
    super(payload);
    this._type = CommentTypeEnum.USER_COMMENT;
    this._owner = payload.owner;
    this._tags = payload.tags;
  }

  static async new(
    payload: CreateCommentEntityPayload<"user", "all">,
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

  constructor(payload: CreateCommentEntityPayload<"system", "all">) {
    super(payload);
    this._type = CommentTypeEnum.SYSTEM_COMMENT;
    this._subText = payload.subText;
  }

  static async new(
    payload: CreateCommentEntityPayload<"system", "all">,
  ): Promise<SystemComment> {
    const entity = new SystemComment(payload);
    await entity.validate();
    return entity;
  }
}
