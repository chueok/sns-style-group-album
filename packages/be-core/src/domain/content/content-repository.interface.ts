import { Nullable, TMedia } from '../..';
import { z } from 'zod';

export const SMediaSortOrder = z.enum(['asc', 'desc']);
export type TMediaSortOrder = z.infer<typeof SMediaSortOrder>;

export const SMediaPaginationParams = z.object({
  limit: z.number(),
  sortOrder: SMediaSortOrder,
  cursor: z.string().nullish(),
});
export type TMediaPaginationParams = z.infer<typeof SMediaPaginationParams>;

export type TMediaPaginationResult<T> = {
  items: T[];
  sortOrder: TMediaSortOrder;
  nextCursor?: string;
};

export interface IContentRepository {
  findMediaById(id: string): Promise<TMedia>;

  findMediaInGroupOrderByCreated(payload: {
    groupId: string;
    pagination: TMediaPaginationParams;
  }): Promise<TMediaPaginationResult<TMedia>>;

  findMemberId(payload: {
    userId: string;
    groupId: string;
  }): Promise<Nullable<string>>;

  isContentOwner(payload: {
    userId: string;
    contentId: string;
  }): Promise<boolean>;

  hasAccessToContent(payload: {
    userId: string;
    contentId: string;
  }): Promise<boolean>;

  createMediaUploadUrls(payload: {
    groupId: string;
    ownerId: string;
    media: {
      size: number;
      ext: string;
      mimeType: string;
    }[];
  }): Promise<string[]>;
}
