import {
  IsArray,
  IsEnum,
  IsInstance,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
} from "class-validator";
import { EntityWithCUDTime } from "../../../common/entity/entity-with-cudtime";
import { ContentTypeEnum } from "../enum/content-type-enum";
import { CreateContentEntityPayload } from "./type/create-content-entity-payload";
import { v4 } from "uuid";
import { Nullable } from "../../../common/type/common-types";
import { ReferredContent } from "./referred-content";
import { ContentLike } from "./content-like";
import { Comment } from "../../comment/entity/comment.abstract";
import { ContentId } from "./type/content-id";
import { GroupId } from "../../group/entity/type/group-id";
import { UserId } from "../../user/entity/type/user-id";

export abstract class Content extends EntityWithCUDTime<ContentId> {
  @IsUUID()
  protected override readonly _id: ContentId;

  @IsUUID()
  readonly groupId: GroupId;

  @IsEnum(ContentTypeEnum)
  protected _type!: ContentTypeEnum;
  get type(): ContentTypeEnum {
    return this._type;
  }

  @IsUUID("all")
  readonly ownerId: UserId;

  @IsArray()
  protected _referred: ReferredContent[];
  get referred(): ReferredContent[] {
    return this._referred;
  }

  @IsOptional()
  @IsString()
  // bucket/groups/groupId/contents/contentId/thumbnail.img
  protected _thumbnailRelativePath: Nullable<string>;
  get thumbnailRelativePath(): Nullable<string> {
    return this._thumbnailRelativePath;
  }

  // like
  @IsNumber()
  protected _numLikes: number;
  get numLikes(): number {
    return this._numLikes;
  }

  @IsInstance(ContentLike, { each: true })
  protected _likeList: ContentLike[];
  get likeList(): ContentLike[] {
    return this._likeList;
  }

  // comment
  @IsNumber()
  protected _numComments: number;
  get numComments(): number {
    return this._numComments;
  }

  @IsArray()
  readonly commentList: Comment[];

  public async addLike(userId: string): Promise<void> {
    const newLike = new ContentLike({
      id: v4(),
      userId: userId,
      createdDateTime: new Date(),
    });
    this._likeList.push(newLike);
    this._numLikes++;
    await this.validate();
  }

  constructor(payload: CreateContentEntityPayload<"base", "all">) {
    super();

    this.groupId = payload.groupId;
    this.ownerId = payload.ownerId;
    this._referred = payload.referred;
    this._thumbnailRelativePath = payload.thumbnailRelativePath;

    if ("id" in payload) {
      this._id = payload.id;
      this._createdDateTime = payload.createdDateTime;
      this._updatedDateTime = payload.updatedDateTime || null;
      this._deletedDateTime = payload.deletedDateTime || null;

      this._numLikes = payload.numLikes;
      this._likeList = payload.likeList;
      this._numComments = payload.numComments;
      this.commentList = payload.commentList;
    } else {
      this._id = v4() as ContentId;
      this._createdDateTime = new Date();
      this._updatedDateTime = null;
      this._deletedDateTime = null;

      this._numLikes = 0;
      this._likeList = [];
      this._numComments = 0;
      this.commentList = [];
    }
  }
}
