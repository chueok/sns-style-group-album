import {
  CommentId,
  ContentId,
  ECommentCategory,
  ICommentRepository,
  TComment,
  TCommentPaginationParams,
  TCommentPaginationResult,
  UserId,
} from '@repo/be-core';
import { DataSource, Repository } from 'typeorm';
import { TypeormComment } from '../infrastructure/persistence/typeorm/entity/comment/typeorm-comment.entity';
import { CommentMapper } from './mapper/comment-mapper';
import { Logger, LoggerService, Optional } from '@nestjs/common';
import { v6 } from 'uuid';
import { TypeormMedia } from '../infrastructure/persistence/typeorm/entity/media/typeorm-media.entity';

export class TypeormCommentRepository implements ICommentRepository {
  private readonly commentRepository: Repository<TypeormComment>;
  private readonly contentRepository: Repository<TypeormMedia>;
  private readonly logger: LoggerService;

  constructor(dataSource: DataSource, @Optional() logger?: LoggerService) {
    this.commentRepository = dataSource.getRepository(TypeormComment);
    this.contentRepository = dataSource.getRepository(TypeormMedia);
    this.logger = logger || new Logger(TypeormCommentRepository.name);
  }
  async isCommentOwner(payload: {
    commentId: string;
    userId: string;
  }): Promise<boolean> {
    const count = await this.commentRepository.count({
      where: {
        id: payload.commentId as CommentId,
        ownerId: payload.userId as UserId,
      },
    });
    return count > 0;
  }
  async hasAccessToContent(payload: {
    contentId: string;
    userId: string;
  }): Promise<boolean> {
    const qb = this.contentRepository
      .createQueryBuilder('content')
      .leftJoin('content.group', 'group')
      .leftJoin('group.members', 'member')
      .where('content.id = :contentId', { contentId: payload.contentId })
      .andWhere('member.id = :userId', { userId: payload.userId })
      .andWhere('content.deletedDateTime IS NULL');
    const count = await qb.getCount();
    return count > 0;
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
      ownerId: comment.ownerId as UserId,
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

  // async findCommentListForFeed(payload: {
  //   groupId: string;
  //   pagination: CommentPagenationType;
  // }): Promise<Comment[]> {
  //   const query = this.commentRepository
  //     .createQueryBuilder('comment')
  //     .innerJoinAndSelect('comment.content', 'content')
  //     .leftJoinAndSelect('comment.tags', 'tags')
  //     .where('content.groupId = :groupId', { groupId: payload.groupId })
  //     .orderBy(
  //       `comment.${payload.pagination.by}`,
  //       payload.pagination.direction === 'desc' ? 'DESC' : 'ASC'
  //     )
  //     .take(payload.pagination.limit);

  //   if (payload.pagination.cursor) {
  //     if (payload.pagination.direction === 'desc') {
  //       query.andWhere(`comment.${payload.pagination.by} < :cursor`, {
  //         cursor: payload.pagination.cursor,
  //       });
  //     } else {
  //       query.andWhere(`comment.${payload.pagination.by} > :cursor`, {
  //         cursor: payload.pagination.cursor,
  //       });
  //     }
  //   }
  //   const ormCommentList = await query.getMany();

  //   const elements = await Promise.all(
  //     ormCommentList.map(async (ormComment) => {
  //       return {
  //         comment: ormComment,
  //         tags: await ormComment.tags,
  //       };
  //     })
  //   );

  //   const { results, errors } = await CommentMapper.toDomainEntity({
  //     elements,
  //   });

  //   errors.forEach((error) => {
  //     this.logger.error(error);
  //   });

  //   return results;
  // }
}
