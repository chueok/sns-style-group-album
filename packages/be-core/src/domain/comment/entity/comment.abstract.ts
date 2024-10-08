import { IsEnum, IsInstance, IsString, IsUUID } from "class-validator";
import { EntityWithCUDTime } from "../../../common/entity/entity-with-cudtime";
import { CommentTypeEnum } from "../enum/comment-type-enum";
import { CreateCommentEntityPayload } from "./type/create-comment-entity-payload";
import { v4 } from "uuid";
import { CommentId } from "./type/comment-id";
import { ContentId } from "../../content/entity/type/content-id";
import { CommentUserTag } from "./comment-user-tag";

export abstract class Comment extends EntityWithCUDTime<CommentId> {
  // TODO : isUserId 같은 util 함수를 만들어, 검사하는 로직 만들 것
  @IsUUID()
  protected override _id!: CommentId;

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

  @IsInstance(CommentUserTag, { each: true })
  protected _userTags: CommentUserTag[];
  get userTags(): CommentUserTag[] {
    return this._userTags;
  }

  @IsUUID()
  protected _contentId: ContentId;
  get contentId(): ContentId {
    return this._contentId;
  }

  public async changeComment(
    text: string,
    userTags: CommentUserTag[],
  ): Promise<void> {
    this._text = text;
    this._userTags = userTags;
    this._updatedDateTime = new Date();

    await this.validate();
  }

  constructor(payload: CreateCommentEntityPayload<"base", "all">) {
    super();
    this._text = payload.text;
    this._contentId = payload.contentId;
    this._userTags = payload.userTags;
    if ("id" in payload) {
      this._id = payload.id;
      this._createdDateTime = payload.createdDateTime;
      this._updatedDateTime = payload.updatedDateTime || null;
      this._deletedDateTime = payload.deletedDateTime || null;
    } else {
      this._id = v4() as CommentId;
      this._createdDateTime = new Date();
      this._updatedDateTime = null;
      this._deletedDateTime = null;
    }
  }
}
