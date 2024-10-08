import { BucketStatusEnum } from "../../enum/bucket-status";
import { ReferredContent } from "../referred-content";
import { ContentLike } from "../content-like";
import { Nullable } from "../../../../common/type/common-types";
import { Comment } from "../../../comment/entity/comment.abstract";
import { GroupId } from "../../../group/entity/type/group-id";
import { UserId } from "../../../user/entity/type/user-id";
import { ContentId } from "./content-id";

type CreateNewBaseContentEntityPayload = {
  groupId: GroupId;
  ownerId: UserId;
  referred: ReferredContent[];
  thumbnailRelativePath: Nullable<string>;
};

type CreateExistingBaseContentEntityPayload =
  CreateNewBaseContentEntityPayload & {
    id: ContentId;
    createdDateTime: Date;
    updatedDateTime: Nullable<Date>;
    deletedDateTime: Nullable<Date>;

    numLikes: number;
    likeList: ContentLike[];
    numComments: number;
    commentList: Comment[];
  };

type CreateBaseContentEntityPayload = {
  all:
    | CreateNewBaseContentEntityPayload
    | CreateExistingBaseContentEntityPayload;
  new: CreateNewBaseContentEntityPayload;
  existing: CreateExistingBaseContentEntityPayload;
};

type SystemContentAdditionalPayload = {
  text: string;
  subText: Nullable<string>;
};

type ImageContentAdditionalPayload = {
  largeRelativePath: Nullable<string>;
  originalRelativePath: string;
  size: number;
  ext: string;
  mimeType: string;
};

type VideoContentAdditionalPayload = {
  originalRelativePath: string;
  size: number;
  ext: string;
  mimeType: string;
};

type PostContentAdditionalPayload = {
  title: string;
  text: string;
};

type BucketContentAdditionalPayload = {
  title: string;
  status: BucketStatusEnum;
};

type ScheduleContentAdditionalPayload = {
  title: string;
  endDateTime: Date;
  startDateTime: Nullable<Date>;
  isAllDay: boolean;
};

type ContentAdditionalPayload = {
  base: object;
  system: SystemContentAdditionalPayload;
  image: ImageContentAdditionalPayload;
  video: VideoContentAdditionalPayload;
  post: PostContentAdditionalPayload;
  bucket: BucketContentAdditionalPayload;
  schedule: ScheduleContentAdditionalPayload;
};

export type CreateContentEntityPayload<
  C extends keyof ContentAdditionalPayload,
  T extends keyof CreateBaseContentEntityPayload,
> = CreateBaseContentEntityPayload[T] & ContentAdditionalPayload[C];
