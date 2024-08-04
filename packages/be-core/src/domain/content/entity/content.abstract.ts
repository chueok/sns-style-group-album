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
import { ContentType } from "../enum/content-type";
import { ContentUser } from "./content-user";
import { CreateContentEntityPayload } from "./type/create-content-entity-payload";
import { v4 } from "uuid";
import { Optional } from "../../../common/type/common-types";

export abstract class Content extends EntityWithCUDTime<string> {
  @IsUUID()
  protected override _id: string;

  @IsUUID()
  protected _groupId: string;
  get groupId(): string {
    return this._groupId;
  }

  @IsEnum(ContentType)
  protected _type!: ContentType;
  get type(): ContentType {
    return this._type;
  }

  @IsInstance(ContentUser)
  protected _owner: ContentUser;
  get owner(): ContentUser {
    return this._owner;
  }

  @IsArray()
  protected _refered: Content[];
  get refered(): Content[] {
    return this._refered;
  }

  @IsOptional()
  @IsString()
  protected _thumbnailRelativePath?: string;
  get thumbnailRelativePath(): Optional<string> {
    return this._thumbnailRelativePath;
  }

  @IsNumber()
  protected _numLikes: number;
  get numLikes(): number {
    return this._numLikes;
  }

  @IsInstance(ContentUser, { each: true })
  protected _recentlyLikedMembers: Set<ContentUser>;
  get recentlyLikedMembers(): Set<ContentUser> {
    return this._recentlyLikedMembers;
  }

  @IsNumber()
  protected _numComments: number;
  get numComments(): number {
    return this._numComments;
  }

  @IsInstance(ContentUser, { each: true })
  protected _recentlyCommentedMembers: Set<ContentUser>;
  get recentlyCommentedMembers(): Set<ContentUser> {
    return this._recentlyCommentedMembers;
  }

  constructor(payload: CreateContentEntityPayload<"base", "all">) {
    super();

    this._groupId = payload.groupId;
    this._owner = payload.owner;
    this._refered = payload.refered;
    this._thumbnailRelativePath = payload.thumbnailRelativePath;

    if ("id" in payload) {
      this._id = payload.id;
      this._createdDateTime = payload.createdDateTime;
      this._updatedDateTime = payload.updatedDateTime || null;
      this._deletedDateTime = payload.deletedDateTime || null;

      this._numLikes = payload.numLikes;
      this._recentlyLikedMembers = payload.recentlyLikedMembers;
      this._numComments = payload.numComments;
      this._recentlyCommentedMembers = payload.recentlyCommentedMembers;
    } else {
      this._id = v4();
      this._createdDateTime = new Date();
      this._updatedDateTime = null;
      this._deletedDateTime = null;

      this._numLikes = 0;
      this._recentlyLikedMembers = new Set();
      this._numComments = 0;
      this._recentlyCommentedMembers = new Set();
    }
  }
}
