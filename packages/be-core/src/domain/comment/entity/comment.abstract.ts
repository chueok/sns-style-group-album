import { IsEnum, IsString, IsUUID } from "class-validator";
import { EntityWithCUDTime } from "../../../common/entity/entity-with-cudtime";
import { CommentType } from "../enum/comment-type";
import { CreateCommentEntityPayload } from "./type/create-comment-entity-payload";
import { v4 } from "uuid";

export abstract class Comment extends EntityWithCUDTime<string> {
  @IsUUID()
  protected override _id!: string;

  @IsEnum(CommentType)
  protected _type!: CommentType;
  get type(): CommentType {
    return this._type;
  }

  @IsString()
  protected _text: string;
  get text(): string {
    return this._text;
  }

  @IsUUID()
  protected _contentId: string;
  get contentId(): string {
    return this._contentId;
  }

  constructor(payload: CreateCommentEntityPayload<"base", "all">) {
    super();
    this._text = payload.text;
    this._contentId = payload.contentId;
    if ("id" in payload) {
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
