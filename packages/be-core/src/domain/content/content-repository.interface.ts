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

  /**
   * 유효한 Media를 반환
   */
  findMediaById(id: string): Promise<Nullable<TMedia>>;

  /**
   * 그룹 내 유효한 미디어 목록을 반환
   */
  findMediaListBy(
    payload: {
      groupId: string;
    },
    pagination: TMediaPaginationParams
  ): Promise<TMediaPaginationResult<TMedia>>;

  createMedia(payload: {
    groupId: string;
    ownerId: string;
    media: {
      thumbnailPath: string;
      originalPath: string;
      largePath?: string;
      size: number;
      ext: string;
      mimeType: string;
    }[];
  }): Promise<void>;
}
