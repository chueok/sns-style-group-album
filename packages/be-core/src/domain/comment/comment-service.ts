import {
  ICommentRepository,
  TCommentPaginationParams,
  TCommentPaginationResult,
} from './comment-repository.interface';
import { TComment } from './entity/comment';
import { ECommentCategory } from './enum/comment-category';

export class CommentService {
  constructor(private readonly commentRepository: ICommentRepository) {}

  async createUserComment(payload: {
    requesterId: string;
    contentId: string;
    text: string;
  }): Promise<TComment> {
    const { requesterId, contentId, text } = payload;

    const hasAccess = await this.commentRepository.hasAccessToContent({
      contentId,
      userId: requesterId,
    });
    if (!hasAccess) {
      throw new Error('You do not have access to this content');
    }

    const comment = await this.commentRepository.createComment({
      ownerId: requesterId,
      category: ECommentCategory.USER_COMMENT,
      contentId,
      text,
    });

    return comment;
  }

  async updateUserComment(payload: {
    requesterId: string;
    commentId: string;
    text: string;
  }): Promise<TComment> {
    const { requesterId, commentId, text } = payload;

    const isOwner = await this.commentRepository.isCommentOwner({
      commentId,
      userId: requesterId,
    });
    if (!isOwner) {
      throw new Error('You do not have access to this comment');
    }

    const comment = await this.commentRepository.updateComment({
      commentId,
      text,
    });
    return comment;
  }

  async getCommentsOfContent(payload: {
    requesterId: string;
    contentId: string;
    pagination: TCommentPaginationParams;
  }): Promise<TCommentPaginationResult<TComment>> {
    const { requesterId, contentId, pagination } = payload;

    const hasAccess = await this.commentRepository.hasAccessToContent({
      contentId,
      userId: requesterId,
    });
    if (!hasAccess) {
      throw new Error('You do not have access to this content');
    }

    const comments = await this.commentRepository.findCommentsOfContent({
      contentId,
      pagination,
    });
    return comments;
  }
}
