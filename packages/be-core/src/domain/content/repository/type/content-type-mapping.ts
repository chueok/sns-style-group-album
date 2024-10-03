import {
  SystemContent,
  VideoContent,
  ImageContent,
  PostContent,
  BucketContent,
  ScheduleContent,
} from "../../entity/content";
import { Content } from "../../entity/content.abstract";
import { ContentTypeEnum } from "../../enum/content-type-enum";

export type ContentTypeToContentMap = {
  [ContentTypeEnum.SYSTEM]: SystemContent;
  [ContentTypeEnum.VIDEO]: VideoContent;
  [ContentTypeEnum.IMAGE]: ImageContent;
  [ContentTypeEnum.POST]: PostContent;
  [ContentTypeEnum.BUCKET]: BucketContent;
  [ContentTypeEnum.SCHEDULE]: ScheduleContent;
};

export type ContentByContentType<T extends ContentTypeEnum | null = null> =
  T extends keyof ContentTypeToContentMap
    ? ContentTypeToContentMap[T]
    : Content[];
