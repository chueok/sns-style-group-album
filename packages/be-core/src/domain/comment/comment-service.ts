import { Code } from '../../common/exception/code';
import { Exception } from '../../common/exception/exception';
import {
  ICommentRepository,
  TCommentPaginationParams,
  TCommentPaginationResult,
} from './comment-repository.interface';
import { TComment, TUserComment } from './entity/comment';
import { ECommentCategory } from './enum/comment-category';

export class CommentService {
  constructor(private readonly commentRepository: ICommentRepository) {}

  async createUserComment(payload: {
    requesterId: string;
    contentId: string;
    text: string;
  }): Promise<TUserComment> {
    const { requesterId, contentId, text } = payload;

    const member = await this.commentRepository.hasAccessToContent({
      contentId,
      userId: requesterId,
    });
    if (!member) {
      throw new Error('You do not have access to this content');
    }

    const comment = await this.commentRepository.createComment({
      ownerId: member.id,
      category: ECommentCategory.USER_COMMENT,
      contentId,
      groupId: member.groupId,
      text,
    });

    if (!comment.contentId || !comment.ownerId) {
      throw Exception.new({
        code: Code.ENTITY_VALIDATION_ERROR,
        overrideMessage: 'Comment is not valid',
      });
    }

    return {
      ...comment,
      contentId: comment.contentId,
      ownerId: comment.ownerId,
      subText: undefined,
    } satisfies TUserComment;
  }

  async updateUserComment(payload: {
    requesterId: string;
    commentId: string;
    text: string;
  }): Promise<TComment> {
    const { requesterId, commentId, text } = payload;

    const owner = await this.commentRepository.findMemberBy({
      commentId,
    });
    if (!owner) {
      throw new Error('Can not find comment owner');
    }
    if (owner.id !== requesterId) {
      throw new Error('You do not have access to this comment');
    }

    const comment = await this.commentRepository.updateComment({
      commentId,
      text,
    });
    return comment;
  }

  async getComment(payload: {
    requesterId: string;
    commentId: string;
  }): Promise<TComment> {
    const { requesterId, commentId } = payload;

    const comment = await this.commentRepository.findCommentBy({
      commentId,
    });
    if (!comment) {
      throw new Error('Can not find comment');
    }

    // NOTE 권한 검사가 db조회에 후행하고 있음. 관리 잘 할 것
    const member = await this.commentRepository.findMemberBy({
      userId: requesterId,
      groupId: comment.groupId,
    });
    if (!member) {
      throw new Error('You do not have access to this comment');
    }

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

    const comments = await this.commentRepository.findCommentListBy(
      {
        contentId,
      },
      pagination
    );
    return comments;
  }

  async getCommentsOfGroup(payload: {
    requesterId: string;
    groupId: string;
    pagination: TCommentPaginationParams;
  }): Promise<TCommentPaginationResult<TComment>> {
    const { requesterId, groupId, pagination } = payload;

    const member = await this.commentRepository.findMemberBy({
      groupId,
      userId: requesterId,
    });
    if (!member) {
      throw new Error('You do not have access to this group');
    }

    const comments = await this.commentRepository.findCommentListBy(
      {
        groupId,
      },
      pagination
    );

    return comments;
  }
}
