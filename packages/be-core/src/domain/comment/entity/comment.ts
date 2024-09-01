import { Nullable, Optional } from "../../../common/type/common-types";
import { CreateCommentEntityPayload } from "./type/create-comment-entity-payload";
import { Comment } from "./comment.abstract";
import { IsInstance, IsOptional, IsString } from "class-validator";
import { CommentTypeEnum } from "../enum/comment-type-enum";
import { CommentUser } from "./comment-owner";

export class UserComment extends Comment {
  @IsInstance(CommentUser)
  protected _owner: CommentUser;
  get owner(): CommentUser {
    return this._owner;
  }

  @IsOptional()
  @IsInstance(CommentUser, { each: true })
  protected _tags: Optional<CommentUser[]>;
  get tags(): Optional<CommentUser[]> {
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
