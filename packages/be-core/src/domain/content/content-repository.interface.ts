import { TMedia } from '../..';
import { z } from 'zod';

export const SMediaSortOrder = z.enum(['asc', 'desc']);
export type TSortOrder = z.infer<typeof SMediaSortOrder>;

export const SMediaPaginationParams = z.object({
  limit: z.number(),
  sortOrder: SMediaSortOrder,
  cursor: z.string().nullish(),
});
export type TMediaPaginationParams = z.infer<typeof SMediaPaginationParams>;

export type TMediaPaginationResult<T> = {
  items: T[];
  sortOrder: TSortOrder;
  nextCursor?: string;
};

export interface IContentRepository {
  // createContent(content: Content): Promise<boolean>;
  // updateContent(content: Content): Promise<boolean>;

  // findContentById(contentId: string): Promise<Nullable<Content>>;

  findMediaInGroupOrderByCreated(payload: {
    groupId: string;
    pagination: TMediaPaginationParams;
  }): Promise<TMediaPaginationResult<TMedia>>;

  // findContentsByGroupIdAndType<T extends EContentCategory>(payload: {
  //   groupId: string;
  //   contentTypeList: T[];
  //   pagination: ContentPaginationOptions;
  // }): Promise<ContentByContentCategory<T>[]>;

  // findContentsByGroupMember(payload: {
  //   userId: string;
  //   groupId: string;
  // }): Promise<Content[]>;

  isGroupMember(payload: { userId: string; groupId: string }): Promise<boolean>;

  createMediaUploadUrls(payload: {
    groupId: string;
    ownerId: string;
    media: {
      size: number;
      ext: string;
      mimeType: string;
    }[];
  }): Promise<string[]>;

  // delete is not supported
}
