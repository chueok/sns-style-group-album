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
} from '@repo/be-core';
import { DataSource, IsNull, Repository } from 'typeorm';
import { TypeormComment } from '../../typeorm/entity/comment/typeorm-comment.entity';
import { CommentMapper } from './mapper/comment-mapper';
import { Logger, LoggerService, Optional } from '@nestjs/common';
import { v6 } from 'uuid';
import { TypeormMedia } from '../../typeorm/entity/content/typeorm-content.entity';
import { TypeormMember } from '../../typeorm/entity/group/typeorm-member.entity';

export class TypeormCommentRepository implements ICommentRepository {
  private readonly commentRepository: Repository<TypeormComment>;
  private readonly contentRepository: Repository<TypeormMedia>;
  private readonly typeormGroupMemberRepository: Repository<TypeormMember>;
  private readonly logger: LoggerService;

  constructor(dataSource: DataSource, @Optional() logger?: LoggerService) {
    this.commentRepository = dataSource.getRepository(TypeormComment);
    this.contentRepository = dataSource.getRepository(TypeormMedia);
    this.typeormGroupMemberRepository = dataSource.getRepository(TypeormMember);
    this.logger = logger || new Logger(TypeormCommentRepository.name);
  }

  async findMemberBy(
    by:
      | {
          groupId: string;
          userId: string;
        }
      | {
          commentId: string; // return comment owner
        }
  ): Promise<Nullable<TCommentMember>> {
    let result: Nullable<TCommentMember> = null;

    if ('groupId' in by) {
      const { groupId, userId } = by;

      const queryBuilder = this.typeormGroupMemberRepository
        .createQueryBuilder('member')
        .where('member.status = :status', { status: 'approved' })
        .andWhere('member.groupId = :groupId', { groupId })
        .andWhere('member.userId = :userId', { userId });
      result = await queryBuilder.getOne();
    }
    if ('commentId' in by) {
      const { commentId } = by;

      const queryBuilder = this.commentRepository
        .createQueryBuilder('comment')
        .leftJoinAndSelect('comment.owner', 'owner')
        .where('comment.id = :commentId', { commentId })
        .andWhere('owner.status = :status', { status: 'approved' });
      const comment = await queryBuilder.getOne();
      if (!comment) {
        return null;
      }
      if (!comment.__owner__) {
        throw new Error('sql is wrong');
      }
      result = comment.__owner__;
    }

    if (!result) {
      return null;
    }

    return {
      id: result.id,
      username: result.username,
      profileImageUrl: result.profileImageUrl,
      groupId: result.groupId,
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
      groupId: member.groupId,
    };
  }

  async createComment(comment: {
    ownerId: string;
    category: ECommentCategory;
    contentId: string;
    groupId: string;
    text: string;
  }): Promise<TComment> {
    const newComment = this.commentRepository.create({
      id: v6() as CommentId,
      commentCategory: comment.category,
      text: comment.text,
      createdDateTime: new Date(),

      contentId: comment.contentId as ContentId,
      groupId: comment.groupId,
      ownerId: comment.ownerId,
    });

    const createdComment = await this.commentRepository.save(newComment);
    await createdComment.tags;

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
      where: { id: commentId as CommentId, deletedDateTime: IsNull() },
      relations: {
        tags: true,
      },
    });
    if (!updatedComment) {
      throw new Error('Comment not found');
    }

    return CommentMapper.toDomainEntity(updatedComment);
  }

  async findCommentBy(by: { commentId: string }): Promise<Nullable<TComment>> {
    const { commentId } = by;

    const comment = await this.commentRepository
      .createQueryBuilder('comment')
      .leftJoinAndSelect('comment.tags', 'tags')
      .where('comment.id = :commentId', { commentId })
      .andWhere('comment.deletedDateTime IS NULL')
      .getOne();

    if (!comment) {
      return null;
    }

    return CommentMapper.toDomainEntity(comment);
  }
  async findCommentListBy(
    by:
      | {
          groupId: string;
        }
      | {
          contentId: string;
        },
    pagination: TCommentPaginationParams
  ): Promise<TCommentPaginationResult<TComment>> {
    if (Object.keys(by).length === 0) {
      throw new Error('findCommentsBy: by is empty');
    }

    const query = this.commentRepository
      .createQueryBuilder('comment')
      .leftJoinAndSelect('comment.tags', 'tags')
      .orderBy('comment.id', pagination.sortOrder === 'asc' ? 'ASC' : 'DESC')
      .where('comment.deletedDateTime IS NULL')
      .take(pagination.limit);

    if ('contentId' in by) {
      query.andWhere('comment.contentId = :contentId', {
        contentId: by.contentId,
      });
    }
    if ('groupId' in by) {
      query.andWhere('comment.groupId = :groupId', { groupId: by.groupId });
    }

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
