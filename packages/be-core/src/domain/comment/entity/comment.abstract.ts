import { IsEnum, IsString, IsUUID } from "class-validator";
import { EntityWithCUDTime } from "../../../common/entity/entity-with-cudtime";
import { CommentTypeEnum } from "../enum/comment-type-enum";
import { CreateCommentEntityPayload } from "./type/create-comment-entity-payload";
import { v4 } from "uuid";
import { CommentId } from "./type/comment-id";
import { UserId } from "../../user/entity/type/user-id";
import { ContentId } from "../../content/entity/type/content-id";

export abstract class Comment extends EntityWithCUDTime<CommentId> {
  public static readonly TAG_PREFIX = "@#{" as const;
  public static readonly TAG_SUFFIX = "}" as const;
  public static readonly tagRegex = new RegExp(
    `@#\\{([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12})\\}`,
    "g",
  );

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

  @IsUUID("all", { each: true })
  protected _userTags: UserId[];
  get userTags(): UserId[] {
    return this._userTags;
  }

  @IsUUID()
  protected _contentId: ContentId;
  get contentId(): ContentId {
    return this._contentId;
  }

  public async changeText(text: string) {
    this._text = text;
    this._userTags = this.extractUserTags(this.text);
    this._updatedDateTime = new Date();
    await this.validate();
  }

  private extractUserTags(text: string): UserId[] {
    const extractedSet: Set<UserId> = new Set();

    let match: RegExpExecArray | null;
    while ((match = Comment.tagRegex.exec(text)) !== null) {
      if (match[1]) {
        extractedSet.add(match[1] as UserId);
      }
    }

    return Array.from(extractedSet);
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
      this._id = v4() as CommentId;
      this._createdDateTime = new Date();
      this._updatedDateTime = null;
      this._deletedDateTime = null;
      this._userTags = this.extractUserTags(this.text);
    }
  }
}
