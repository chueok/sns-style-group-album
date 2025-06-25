import { Nullable, TContentMember, TMedia } from '../..';
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
  // approved 상태의 멤버를 반환
  findApprovedMember(payload: {
    userId: string;
    groupId: string;
  }): Promise<Nullable<TContentMember>>;

  // '유효한' 컨텐츠의 오너를 반환
  // 오너는 'approved'가 아니어도 무관.
  findContentOwner(payload: {
    contentId: string;
  }): Promise<Nullable<TContentMember>>;

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
