import {
  SystemContent,
  VideoContent,
  ImageContent,
  PostContent,
  BucketContent,
  ScheduleContent,
} from '../entity/content';
import { Content } from '../entity/content.abstract';
import { EContentCategory } from './content-category';

export type ContentCategoryToContentMap = {
  [EContentCategory.SYSTEM]: SystemContent;
  [EContentCategory.VIDEO]: VideoContent;
  [EContentCategory.IMAGE]: ImageContent;
  [EContentCategory.POST]: PostContent;
  [EContentCategory.BUCKET]: BucketContent;
  [EContentCategory.SCHEDULE]: ScheduleContent;
};

export type ContentByContentCategory<T extends EContentCategory | null = null> =
  T extends keyof ContentCategoryToContentMap
    ? ContentCategoryToContentMap[T]
    : Content[];
