import { BucketStatus } from "../../enum/bucket-status";
import { Content } from "../content.abstract";
import { ContentUser } from "../content-user";

type CreateNewBaseContentEntityPayload = {
  groupId: string;
  owner: ContentUser;
  refered: Content[];
  thumbnailRelativePath?: string;
};

type CreateExistingBaseContentEntityPayload =
  CreateNewBaseContentEntityPayload & {
    id: string;
    createdDateTime: Date;
    updatedDateTime?: Date;
    deletedDateTime?: Date;

    numLikes: number;
    recentlyLikedMembers: Set<ContentUser>;
    numComments: number;
    recentlyCommentedMembers: Set<ContentUser>;
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
  subText?: string;
};

type ImageContentAdditionalPayload = {
  thumbnailRelativePath: string;
  largeRelativePath: string;
  originalRelativePath: string;
  size: number;
  ext: string;
  mimeType: string;
};

type VideoContentAdditionalPayload = {
  thumbnailRelativePath: string;
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
  status: BucketStatus;
};

type ScheduleContentAdditionalPayload = {
  title: string;
  startDateTime: Date;
  endDateTime: Date;
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
