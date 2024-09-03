import {
  Comment,
  CommentId,
  CommentPagenationType,
  ICommentRepository,
  Nullable,
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
    const { results, errors } = CommentMapper.toOrmEntity([{ comment }]);

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
    const { results, errors } = CommentMapper.toOrmEntity([{ comment }]);
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
      },
    });
    if (!ormComment) {
      return null;
    }

    const { results, errors } = await CommentMapper.toDomainEntity([
      {
        comment: ormComment,
      },
    ]);
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
      .innerJoinAndSelect("comment.content", "content")
      .where("content.id = :contentId", { contentId: payload.contentId })
      .orderBy("comment.createdDateTime", "DESC")
      .skip((payload.page - 1) * payload.pageSize)
      .take(payload.pageSize)
      .getMany();

    const { results, errors } = await CommentMapper.toDomainEntity(
      ormCommentList.map((comment) => ({
        comment,
      })),
    );
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
      .where("content.groupId = :groupId", { groupId: payload.groupId })
      .orderBy(
        `comment.${payload.pagination.by}`,
        payload.pagination.direction === "desc" ? "DESC" : "ASC",
      )
      .limit(payload.pagination.limit);

    if (payload.pagination.direction === "desc") {
      query.andWhere(`comment.${payload.pagination.by} < :cursor`, {
        cursor: payload.pagination.cursor,
      });
    } else {
      query.andWhere(`comment.${payload.pagination.by} > :cursor`, {
        cursor: payload.pagination.cursor,
      });
    }
    const ormCommentList = await query.getMany();

    const { results, errors } = await CommentMapper.toDomainEntity(
      ormCommentList.map((comment) => ({
        comment,
      })),
    );

    errors.forEach((error) => {
      this.logger.error(error);
    });

    return results;
  }
}
