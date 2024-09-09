import {
  Comment,
  CommentId,
  CommentPagenationType,
  ICommentRepository,
  Nullable,
  UserId,
} from "@repo/be-core";
import { DataSource, Repository } from "typeorm";
import { TypeormComment } from "../../entity/comment/typeorm-comment.entity";
import { CommentMapper } from "./mapper/comment-mapper";
import { Logger, LoggerService, Optional } from "@nestjs/common";

export class TypeormCommentRepository implements ICommentRepository {
  private readonly typeormCommentRepository: Repository<TypeormComment>;
  private readonly logger: LoggerService;

  constructor(dataSource: DataSource, @Optional() logger?: LoggerService) {
    this.typeormCommentRepository = dataSource.getRepository(TypeormComment);
    this.logger = logger || new Logger(TypeormCommentRepository.name);
  }

  async createComment(comment: Comment): Promise<boolean> {
    const { results, errors } = CommentMapper.toOrmEntity({
      elements: [comment],
    });

    errors.forEach((error) => {
      this.logger.error(error);
    });

    if (results.length === 0) {
      return false;
    }

    return this.typeormCommentRepository
      .save(results)
      .then(() => true)
      .catch(() => false);
  }

  async updateComment(comment: Comment): Promise<boolean> {
    const { results, errors } = CommentMapper.toOrmEntity({
      elements: [comment],
    });
    if (results.length === 0) {
      return false;
    }

    errors.forEach((error) => {
      this.logger.error(error);
    });

    return this.typeormCommentRepository
      .save(results)
      .then(() => true)
      .catch(() => false);
  }

  async findCommentById(commentId: CommentId): Promise<Nullable<Comment>> {
    const ormComment = await this.typeormCommentRepository.findOne({
      where: { id: commentId },
      relations: {
        content: true,
        tags: true,
      },
    });
    if (!ormComment) {
      return null;
    }

    const tags: UserId[] = (await ormComment.tags).map((user) => user.id);
    const { results, errors } = await CommentMapper.toDomainEntity({
      elements: [{ comment: ormComment, tags }],
    });
    errors.forEach((error) => {
      this.logger.error(error);
    });

    return results[0] || null;
  }

  async findCommentListByContentId(payload: {
    contentId: string;
    page: number;
    pageSize: number;
  }): Promise<Comment[]> {
    const ormCommentList = await this.typeormCommentRepository
      .createQueryBuilder("comment")
      .where("comment.contentId = :contentId", { contentId: payload.contentId })
      .orderBy("comment.createdDateTime", "DESC")
      .skip((payload.page - 1) * payload.pageSize)
      .take(payload.pageSize)
      .leftJoinAndSelect("comment.tags", "tags")
      .getMany();

    const elements = await Promise.all(
      ormCommentList.map(async (ormComment) => {
        return {
          comment: ormComment,
          tags: (await ormComment.tags).map((user) => user.id),
        };
      }),
    );

    const { results, errors } = await CommentMapper.toDomainEntity({
      elements,
    });
    errors.forEach((error) => {
      this.logger.error(error);
    });

    return results;
  }

  async findCommentListForFeed(payload: {
    groupId: string;
    pagination: CommentPagenationType;
  }): Promise<Comment[]> {
    const query = this.typeormCommentRepository
      .createQueryBuilder("comment")
      .innerJoinAndSelect("comment.content", "content")
      .leftJoinAndSelect("comment.tags", "tags")
      .where("content.groupId = :groupId", { groupId: payload.groupId })
      .orderBy(
        `comment.${payload.pagination.by}`,
        payload.pagination.direction === "desc" ? "DESC" : "ASC",
      )
      .limit(payload.pagination.limit);

    if (payload.pagination.cursor) {
      if (payload.pagination.direction === "desc") {
        query.andWhere(`comment.${payload.pagination.by} < :cursor`, {
          cursor: payload.pagination.cursor,
        });
      } else {
        query.andWhere(`comment.${payload.pagination.by} > :cursor`, {
          cursor: payload.pagination.cursor,
        });
      }
    }
    const ormCommentList = await query.getMany();

    const elements = await Promise.all(
      ormCommentList.map(async (ormComment) => {
        return {
          comment: ormComment,
          tags: (await ormComment.tags).map((user) => user.id),
        };
      }),
    );

    const { results, errors } = await CommentMapper.toDomainEntity({
      elements,
    });

    errors.forEach((error) => {
      this.logger.error(error);
    });

    return results;
  }
}
