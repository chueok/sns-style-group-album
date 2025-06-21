import {
  CommentId,
  ContentId,
  ECommentCategory,
  ICommentRepository,
  Nullable,
  TComment,
  TCommentMember,
  TCommentPaginationParams,
  TCommentPaginationResult,
  UserId,
} from '@repo/be-core';
import { DataSource, Repository } from 'typeorm';
import { TypeormComment } from '../infrastructure/persistence/typeorm/entity/comment/typeorm-comment.entity';
import { CommentMapper } from './mapper/comment-mapper';
import { Logger, LoggerService, Optional } from '@nestjs/common';
import { v6 } from 'uuid';
import { TypeormMedia } from '../infrastructure/persistence/typeorm/entity/content/typeorm-content.entity';

export class TypeormCommentRepository implements ICommentRepository {
  private readonly commentRepository: Repository<TypeormComment>;
  private readonly contentRepository: Repository<TypeormMedia>;
  private readonly logger: LoggerService;

  constructor(dataSource: DataSource, @Optional() logger?: LoggerService) {
    this.commentRepository = dataSource.getRepository(TypeormComment);
    this.contentRepository = dataSource.getRepository(TypeormMedia);
    this.logger = logger || new Logger(TypeormCommentRepository.name);
  }
  async findCommentOwner(payload: {
    commentId: string;
    userId: string;
  }): Promise<Nullable<TCommentMember>> {
    const comment = await this.commentRepository
      .createQueryBuilder('comment')
      .leftJoin('comment.owner', 'owner')
      .where('comment.id = :commentId', { commentId: payload.commentId })
      .andWhere('owner.userId = :userId', { userId: payload.userId })
      .andWhere('owner.status = :status', { status: 'approved' })
      .select(['owner.id', 'owner.username', 'owner.profileImageUrl'])
      .getOne();

    if (!comment) {
      return null;
    }

    if (!comment.__owner__) {
      throw new Error('sql is wrong');
    }

    return {
      id: comment.__owner__.id,
      username: comment.__owner__.username,
      profileImageUrl: comment.__owner__.profileImageUrl,
    };
  }

  async hasAccessToContent(payload: {
    contentId: string;
    userId: string;
  }): Promise<Nullable<TCommentMember>> {
    const qb = this.contentRepository
      .createQueryBuilder('content')
      .leftJoinAndSelect('content.group', 'group')
      .leftJoinAndSelect('group.members', 'member')
      .where('content.id = :contentId', { contentId: payload.contentId })
      .andWhere('content.deletedDateTime IS NULL')
      .andWhere('member.status = :status', { status: 'approved' })
      .andWhere('member.userId = :userId', { userId: payload.userId });

    const content = await qb.getOne();
    if (!content) {
      return null;
    }

    if (!content.__group__ || !content.__group__.__members__) {
      throw new Error('sql is wrong');
    }

    const member = content.__group__.__members__.at(0);
    if (!member) {
      throw new Error('sql is wrong');
    }

    return {
      id: member.id,
      username: member.username,
      profileImageUrl: member.profileImageUrl,
    };
  }

  async createComment(comment: {
    ownerId: string;
    category: ECommentCategory;
    contentId: string;
    text: string;
  }): Promise<TComment> {
    const newComment = this.commentRepository.create({
      id: v6() as CommentId,
      commentCategory: comment.category,
      text: comment.text,
      createdDateTime: new Date(),

      contentId: comment.contentId as ContentId,
      ownerId: comment.ownerId,
    });

    const createdComment = await this.commentRepository.save(newComment);
    return CommentMapper.toDomainEntity(createdComment);
  }

  async updateComment(comment: {
    commentId: string;
    text: string;
  }): Promise<TComment> {
    const { commentId, text } = comment;

    const updatedResult = await this.commentRepository.update(commentId, {
      text,
    });

    if (updatedResult.affected === 0) {
      throw new Error('Comment not found');
    }

    const updatedComment = await this.commentRepository.findOne({
      where: { id: commentId as CommentId },
    });
    if (!updatedComment) {
      throw new Error('Comment not found');
    }

    return CommentMapper.toDomainEntity(updatedComment);
  }

  async findCommentsOfContent(payload: {
    contentId: string;
    pagination: TCommentPaginationParams;
  }): Promise<TCommentPaginationResult<TComment>> {
    const { contentId, pagination } = payload;

    const query = this.commentRepository
      .createQueryBuilder('comment')
      .orderBy('comment.id', pagination.sortOrder === 'asc' ? 'ASC' : 'DESC')
      .where('comment.contentId = :contentId', { contentId })
      .andWhere('comment.deletedDateTime IS NULL')
      .take(pagination.limit);

    if (pagination.cursor) {
      if (pagination.sortOrder === 'asc') {
        query.andWhere('comment.id < :cursor', { cursor: pagination.cursor });
      } else {
        query.andWhere('comment.id > :cursor', { cursor: pagination.cursor });
      }
    }

    const ormComments = await query.getMany();

    const domainComments = CommentMapper.toDomainEntityList(ormComments);
    const nextCursor = domainComments.at(-1)?.id;

    return {
      items: domainComments,
      sortOrder: pagination.sortOrder,
      nextCursor,
    };
  }
}
