import { Nullable } from '../../../common/type/common-types';
import { Comment } from '../entity/comment.abstract';

export type CommentPagenationType = {
  cursor?: Date;
  by: 'createdDateTime';
  direction: 'asc' | 'desc';
  limit: number;
};

export interface ICommentRepository {
  createComment(comment: Comment): Promise<boolean>;

  updateComment(comment: Comment): Promise<boolean>;

  findCommentById(commentId: string): Promise<Nullable<Comment>>;

  findCommentListByContentId(payload: {
    contentId: string;
    page: number;
    pageSize: number;
  }): Promise<Comment[]>;

  findCommentListForFeed(payload: {
    groupId: string;
    pagination: CommentPagenationType;
  }): Promise<Comment[]>;

  // delete is not supported
}
