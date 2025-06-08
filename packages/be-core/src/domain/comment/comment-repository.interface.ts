import { TComment } from './entity/comment';
import { z } from 'zod';
import { ECommentCategory } from './enum/comment-category';

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
  isCommentOwner(payload: {
    commentId: string;
    userId: string;
  }): Promise<boolean>;

  hasAccessToContent(payload: {
    contentId: string;
    userId: string;
  }): Promise<boolean>;

  createComment(comment: {
    ownerId: string;
    category: ECommentCategory;
    contentId: string;
    text: string;
  }): Promise<TComment>;

  updateComment(comment: {
    commentId: string;
    text: string;
  }): Promise<TComment>;

  // findCommentById(commentId: string): Promise<Nullable<Comment>>;

  findCommentsOfContent(payload: {
    contentId: string;
    pagination: TCommentPaginationParams;
  }): Promise<TCommentPaginationResult<TComment>>;

  // findCommentListForFeed(payload: {
  //   groupId: string;
  //   pagination: CommentPagenationType;
  // }): Promise<Comment[]>;

  // delete is not supported
}
