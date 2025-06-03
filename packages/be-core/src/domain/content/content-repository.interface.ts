import { TMedia } from '../..';
import { z } from 'zod';

const SMediaSortField = z.enum(['createdDateTime', 'numLikes', 'numComments']);
type TSortField = z.infer<typeof SMediaSortField>;

const SMediaSortOrder = z.enum(['asc', 'desc']);
type TSortOrder = z.infer<typeof SMediaSortOrder>;

type TCursorValue<T extends TSortField> = T extends 'createdDateTime'
  ? Date
  : T extends 'numLikes'
    ? number
    : T extends 'numComments'
      ? number
      : never;

export const SMediaPaginationParams = z.discriminatedUnion('sortField', [
  z.object({
    limit: z.number(),
    sortField: z.literal('createdDateTime'),
    sortOrder: SMediaSortOrder,
    cursor: z.string().datetime().optional(),
  }),
  z.object({
    limit: z.number(),
    sortField: z.literal('numLikes'),
    sortOrder: SMediaSortOrder,
    cursor: z
      .string()
      .transform((val) => parseInt(val, 10))
      .optional(),
  }),
  z.object({
    limit: z.number(),
    sortField: z.literal('numComments'),
    sortOrder: SMediaSortOrder,
    cursor: z
      .string()
      .transform((val) => parseInt(val, 10))
      .optional(),
  }),
]);
export type TMediaPaginationParams = z.infer<typeof SMediaPaginationParams>;

export type TMediaPaginationResult<T, V extends TSortField = TSortField> = {
  items: T[];
  sortField: V;
  sortOrder: TSortOrder;
  nextCursor?: TCursorValue<V>;
  hasMore: boolean;
};

export interface IContentRepository {
  // createContent(content: Content): Promise<boolean>;
  // updateContent(content: Content): Promise<boolean>;

  // findContentById(contentId: string): Promise<Nullable<Content>>;

  findMediaByGroupId(payload: {
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
