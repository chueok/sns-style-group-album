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

  @IsUUID("all", { each: true })
  protected _userTags: string[];
  get userTags(): string[] {
    return this._userTags;
  }

  @IsUUID()
  protected _contentId: string;
  get contentId(): string {
    return this._contentId;
  }

  public async changeText(text: string) {
    this._text = text;
    this._userTags = this.extractUserTags(this.text);
    this._updatedDateTime = new Date();
    await this.validate();
  }

  private extractUserTags(text: string): string[] {
    // TODO extract user tags from text
    return [];
  }

  constructor(payload: CreateCommentEntityPayload<"base", "all">) {
    super();
    this._text = payload.text;
    this._contentId = payload.contentId;
    if ("id" in payload) {
      this._id = payload.id;
      this._userTags = payload.userTags;
      this._createdDateTime = payload.createdDateTime;
      this._updatedDateTime = payload.updatedDateTime || null;
      this._deletedDateTime = payload.deletedDateTime || null;
    } else {
      this._id = v4();
      this._createdDateTime = new Date();
      this._updatedDateTime = null;
      this._deletedDateTime = null;
      this._userTags = this.extractUserTags(this.text);
    }
  }
}
