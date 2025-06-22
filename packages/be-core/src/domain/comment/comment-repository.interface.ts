import { TComment } from './entity/comment';
import { z } from 'zod';
import { ECommentCategory } from './enum/comment-category';
import { Nullable } from '../../common/type/common-types';
import { TCommentMember } from './entity/comment-member';

export const SCommentSortOrder = z.enum(['asc', 'desc']);
export type TCommentSortOrder = z.infer<typeof SCommentSortOrder>;

export const SCommentPaginationParams = z.object({
  limit: z.number(),
  sortOrder: z.enum(['asc', 'desc']),
  cursor: z.string().nullish(),
});
export type TCommentPaginationParams = z.infer<typeof SCommentPaginationParams>;

export type TCommentPaginationResult<T> = {
  items: T[];
  sortOrder: TCommentSortOrder;
  nextCursor?: string;
};

export interface ICommentRepository {
  findMemberBy(
    by:
      | {
          groupId: string;
          userId: string;
        }
      | {
          commentId: string; // return comment owner
        }
      | {
          userId: string; // content가 속한 그룹에서의 member 정보 리턴
          contentId: string;
        }
  ): Promise<Nullable<TCommentMember>>;

  /**
   * 해당 컨텐츠가 속한 그룹의
   * 승인된 멤버는 컨텐츠에 접근 가능하다.
   */
  hasAccessToContent(payload: {
    contentId: string;
    userId: string;
  }): Promise<Nullable<TCommentMember>>;

  createComment(comment: {
    ownerId: string;
    category: ECommentCategory;
    contentId: string;
    groupId: string;
    text: string;
  }): Promise<TComment>;

  updateComment(comment: {
    commentId: string;
    text: string;
  }): Promise<TComment>;

  findCommentBy(by: { commentId: string }): Promise<Nullable<TComment>>;

  findCommentListBy(
    by:
      | {
          groupId: string;
        }
      | {
          contentId: string;
        },
    pagination: TCommentPaginationParams
  ): Promise<TCommentPaginationResult<TComment>>;
}
