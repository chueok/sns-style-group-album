import {
  Content,
  ContentId,
  ContentPagenationType,
  ContentTypeEnum,
  IContentRepository,
  Nullable,
} from "@repo/be-core";
import { DataSource, Repository } from "typeorm";
import { TypeormContent } from "../../entity/content/typeorm-content.entity";
import { TypeormComment } from "../../entity/comment/typeorm-comment.entity";
import { TypeormLike } from "../../entity/like/typeorm-like.entity";
import { ContentMapper } from "./mapper/content-mapper";
import { Logger, LoggerService, Optional } from "@nestjs/common";

export class TypeormContentRepository implements IContentRepository {
  public static commentLimit = 5;
  public static likeLimit = 5;

  private readonly typeormContentRepository: Repository<TypeormContent>;
  private readonly typeormCommentRepository: Repository<TypeormComment>;
  private readonly typeormLikeRepository: Repository<TypeormLike>;

  private readonly logger: LoggerService;

  constructor(dataSource: DataSource, @Optional() logger?: LoggerService) {
    this.typeormContentRepository = dataSource.getRepository(TypeormContent);
    this.typeormCommentRepository = dataSource.getRepository(TypeormComment);
    this.typeormLikeRepository = dataSource.getRepository(TypeormLike);

    this.logger = logger || new Logger(TypeormContentRepository.name);
  }

  // TODO 트랜잭션 처리 필요
  // 중요한 문제가 생기는건 아닌데, 트랜젝션 안하는게 나을까?
  async createContent(content: Content): Promise<boolean> {
    const { results, errors } = ContentMapper.toOrmEntity({
      elements: [content],
    });
    errors.forEach((error) => {
      this.logger.error(error);
    });
    if (results.length === 0) {
      return false;
    }

    const promiseList = results.map(async (result) => {
      return Promise.all([
        this.typeormLikeRepository.save(result.likeList),
        this.typeormContentRepository.save(result.content),
      ]);
    });

    return Promise.all(promiseList)
      .then(() => true)
      .catch(() => false);
  }

  async updateContent(content: Content): Promise<boolean> {
    const { results, errors } = ContentMapper.toOrmEntity({
      elements: [content],
    });
    errors.forEach((error) => {
      this.logger.error(error);
    });
    if (results.length === 0) {
      return false;
    }

    const promiseList = results.map(async (result) => {
      return Promise.all([
        this.typeormLikeRepository.save(result.likeList),
        this.typeormContentRepository.update(result.content.id, result.content),
      ]);
    });

    return Promise.all(promiseList)
      .then(() => true)
      .catch(() => false);
  }

  async findContentById(contentId: ContentId): Promise<Nullable<Content>> {
    const [content, likeList, numLikes, commentList, numComments] =
      await Promise.all([
        this.typeormContentRepository.findOne({
          where: { id: contentId },
        }),
        this.getRecentLikeList(contentId, TypeormContentRepository.likeLimit),
        this.getNumLikes(contentId),
        this.getRecentCommentList(
          contentId,
          TypeormContentRepository.commentLimit,
        ),
        this.getNumComments(contentId),
      ]);
    if (!content) {
      return null;
    }

    const { results, errors } = await ContentMapper.toDomainEntity({
      elements: [
        {
          content,
          numLikes,
          likeList,
          numComments,
          commentList,
        },
      ],
    });
    errors.forEach((error) => {
      this.logger.error(error);
    });
    return results[0] || null;
  }

  async findContentsByGroupIdAndType(payload: {
    groupId: string;
    contentType: ContentTypeEnum;
    pagination: ContentPagenationType;
  }): Promise<Content[]> {
    const query = this.typeormContentRepository
      .createQueryBuilder("content")
      .innerJoin("content.group", "group")
      .where("group.id = :groupId", { groupId: payload.groupId })
      .andWhere("content.contentType = :contentType", {
        contentType: payload.contentType,
      })
      .orderBy(
        `content.${payload.pagination.by}`,
        payload.pagination.direction === "asc" ? "ASC" : "DESC",
      )
      .limit(payload.pagination.limit);

    if (payload.pagination.cursor) {
      if (payload.pagination.direction === "desc") {
        query.andWhere(`content.${payload.pagination.by} < :cursor`, {
          cursor: payload.pagination.cursor,
        });
      } else {
        query.andWhere(`content.${payload.pagination.by} > :cursor`, {
          cursor: payload.pagination.cursor,
        });
      }
    }

    const ormContentList = await query.getMany();

    return this.ormEntityList2DomainEntityList(ormContentList);
  }

  async findContentsByGroupMember(payload: {
    userId: string;
    groupId: string;
  }): Promise<Content[]> {
    const ormContentList = await this.typeormContentRepository
      .createQueryBuilder("content")
      .where("content.ownerId = :userId", { userId: payload.userId })
      .andWhere("content.groupId = :groupId", { groupId: payload.groupId })
      .getMany();

    return this.ormEntityList2DomainEntityList(ormContentList);
  }

  private async getNumLikes(contentId: string): Promise<number> {
    return this.typeormLikeRepository
      .createQueryBuilder("like")
      .where("like.contentId = :contentId", { contentId })
      .getCount();
  }

  private async getRecentLikeList(
    contentId: string,
    limit: number,
  ): Promise<TypeormLike[]> {
    return this.typeormLikeRepository
      .createQueryBuilder("like")
      .where("like.contentId = :contentId", { contentId })
      .orderBy("like.createdDateTime", "DESC")
      .limit(limit)
      .getMany();
  }

  private async getNumComments(contentId: string): Promise<number> {
    return this.typeormCommentRepository
      .createQueryBuilder("comment")
      .where("comment.contentId = :contentId", { contentId })
      .getCount();
  }

  private async getRecentCommentList(
    contentId: string,
    limit: number,
  ): Promise<TypeormComment[]> {
    return this.typeormCommentRepository
      .createQueryBuilder("comment")
      .where("comment.contentId = :contentId", { contentId })
      .orderBy("comment.createdDateTime", "DESC")
      .limit(limit)
      .getMany();
  }

  private async ormEntityList2DomainEntityList(
    ormContentList: TypeormContent[],
  ): Promise<Content[]> {
    const promiseList = await ormContentList.map(async (ormContent) => {
      const [likeList, numLikes, commentList, numComments] = await Promise.all([
        this.getRecentLikeList(
          ormContent.id,
          TypeormContentRepository.likeLimit,
        ),
        this.getNumLikes(ormContent.id),
        this.getRecentCommentList(
          ormContent.id,
          TypeormContentRepository.commentLimit,
        ),
        this.getNumComments(ormContent.id),
      ]);

      return {
        content: ormContent,
        numLikes,
        likeList,
        numComments,
        commentList,
      };
    });
    const payload = await Promise.all(promiseList);

    const { results, errors } = await ContentMapper.toDomainEntity({
      elements: payload,
    });

    errors.forEach((error) => {
      this.logger.error(error);
    });
    return results;
  }
}
