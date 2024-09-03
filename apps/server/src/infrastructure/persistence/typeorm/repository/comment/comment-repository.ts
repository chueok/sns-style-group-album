import {
  Comment,
  CommentPagenationType,
  ICommentRepository,
  Nullable,
} from "@repo/be-core";
import { DataSource, Repository } from "typeorm";
import { TypeormComment } from "../../entity/comment/typeorm-comment.entity";
import { CommentMapper } from "./mapper/comment-mapper";

export class TypeormCommentRepository implements ICommentRepository {
  private readonly typeormCommentRepository: Repository<TypeormComment>;

  constructor(dataSource: DataSource) {
    this.typeormCommentRepository = dataSource.getRepository(TypeormComment);
  }

  async createComment(comment: Comment): Promise<boolean> {
    const mapResult = CommentMapper.toOrmEntity([{ comment }]);

    if (mapResult.results.length === 0) {
      return false;
    }

    mapResult.errors.forEach((error) => {
      // TODO log error
    });

    return this.typeormCommentRepository
      .save(mapResult.results)
      .then(() => true)
      .catch(() => false);
  }

  async updateComment(comment: Comment): Promise<boolean> {
    const mapResult = CommentMapper.toOrmEntity([{ comment }]);
    if (mapResult.results.length === 0) {
      return false;
    }

    mapResult.errors.forEach((error) => {
      // TODO log error
    });

    return this.typeormCommentRepository
      .save(mapResult.results)
      .then(() => true)
      .catch(() => false);
  }

  async findCommentById(commentId: string): Promise<Nullable<Comment>> {
    const ormComment = await this.typeormCommentRepository.findOne({
      where: { id: commentId },
      relations: {
        content: true,
      },
    });
    if (!ormComment) {
      return null;
    }

    const mapResult = await CommentMapper.toDomainEntity([
      {
        comment: ormComment,
      },
    ]);

    if (mapResult.results.length === 0) {
      return null;
    }

    return mapResult.results[0]!;
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

    const firstOrmComment = ormCommentList[0];
    if (!firstOrmComment) {
      return [];
    }

    const mapResult = await CommentMapper.toDomainEntity(
      ormCommentList.map((comment) => ({
        comment,
      })),
    );

    return mapResult.results;
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

    const mapResult = await CommentMapper.toDomainEntity(
      ormCommentList.map((comment) => ({
        comment,
      })),
    );

    return mapResult.results;
  }
}
