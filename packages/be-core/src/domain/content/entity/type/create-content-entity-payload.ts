import { BucketStatus } from '../../enum/bucket-status';
import { Content } from '../content.abstract';
import { ContentOwner } from '../content-owner';

type CreateNewBaseContentEntityPayload = {
  groupId: string;
  owner: ContentOwner;
};

type CreateExistingBaseContentEntityPayload = {
  id: string;
  groupId: string;
  owner: ContentOwner;
  refered: Content[];
  createdDateTime: Date;
  updatedDateTime?: Date;
  deletedDateTime?: Date;
};

type CreateBaseContentEntityPayload = {
  all: CreateNewBaseContentEntityPayload &
    CreateExistingBaseContentEntityPayload;
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
  base: {};
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
