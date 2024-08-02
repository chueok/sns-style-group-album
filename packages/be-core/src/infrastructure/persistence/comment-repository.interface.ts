import { Nullable } from '../../common/type/common-types';

export interface CommentRepository {
  createComment(comment: Comment): Promise<Comment>;

  updateComment(comment: Comment): Promise<Comment>;

  deleteComment(commentId: string): Promise<boolean>;

  findCommentById(commentId: string): Promise<Nullable<Comment>>;

  findCommentsBy(payload: {
    groupId: string;
    cursor: string; // comment id
    direction: 'next' | 'prev';
    pageSize: number;
  }): Promise<Comment[]>;
}
