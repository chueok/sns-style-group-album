import { IsEnum, IsOptional, IsString, IsUUID } from "class-validator";
import { EntityWithCUDTime } from "../../../common/entity/entity-with-cudtime";
import { CommentTypeEnum } from "../enum/comment-type-enum";
import { CreateCommentEntityPayload } from "./type/create-comment-entity-payload";
import { v4 } from "uuid";
import { Nullable } from "../../../common/type/common-types";

export abstract class Comment extends EntityWithCUDTime<string> {
  @IsUUID()
  protected override _id!: string;

  @IsEnum(CommentTypeEnum)
  protected _type!: CommentTypeEnum;
  get type(): CommentTypeEnum {
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

  @IsOptional()
  @IsString()
  protected _contentThumbnailRelativePath: Nullable<string>;
  get contentThumbnailRelativePath(): Nullable<string> {
    return this._contentThumbnailRelativePath;
  }

  public changeText(text: string) {
    this._text = text;
    this._updatedDateTime = new Date();
  }

  constructor(payload: CreateCommentEntityPayload<"base", "all">) {
    super();
    this._text = payload.text;
    this._contentId = payload.contentId;
    this._contentThumbnailRelativePath = payload.contentThumbnailRelativePath;
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
