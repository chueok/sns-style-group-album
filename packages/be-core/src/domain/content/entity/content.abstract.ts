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

export abstract class Content extends EntityWithCUDTime<string> {
  @IsUUID()
  protected override _id: string;

  @IsUUID()
  protected _groupId: string;
  get groupId(): string {
    return this._groupId;
  }

  @IsEnum(ContentTypeEnum)
  protected _type!: ContentTypeEnum;
  get type(): ContentTypeEnum {
    return this._type;
  }

  @IsString()
  protected _ownerId: string;
  get ownerId(): string {
    return this._ownerId;
  }

  @IsArray()
  protected _referred: ReferredContent[];
  get referred(): ReferredContent[] {
    return this._referred;
  }

  @IsOptional()
  @IsString()
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
  protected _commentList: Readonly<Comment>[];
  get commentList(): Readonly<Comment>[] {
    return this._commentList;
  }

  public async addLike(payload: {
    userId: string;
    userThumbnailRelativePath: string;
  }): Promise<void> {
    const newLike = new ContentLike({
      id: v4(),
      userId: payload.userId,
      userThumbnailRelativePath: payload.userThumbnailRelativePath,
      createdDateTime: new Date(),
    });
    this._likeList.push(newLike);
    this._numLikes++;
    await this.validate();
  }

  constructor(payload: CreateContentEntityPayload<"base", "all">) {
    super();

    this._groupId = payload.groupId;
    this._ownerId = payload.ownerId;
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
      this._commentList = payload.commentList;
    } else {
      this._id = v4();
      this._createdDateTime = new Date();
      this._updatedDateTime = null;
      this._deletedDateTime = null;

      this._numLikes = 0;
      this._likeList = [];
      this._numComments = 0;
      this._commentList = [];
    }
  }
}
