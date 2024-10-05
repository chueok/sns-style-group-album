import {
  Content,
  ContentByContentType,
  ContentId,
  ContentPaginationOptions,
  ContentTypeEnum,
  IContentRepository,
  Nullable,
} from "@repo/be-core";
import { Brackets, DataSource, Repository } from "typeorm";
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
        this.typeormContentRepository
          .createQueryBuilder("content")
          .leftJoinAndSelect("content.referred", "referred")
          .where("content.id = :contentId", { contentId })
          .andWhere("content.deletedDateTime is null")
          .getOne(),
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
    const referred = await content.referred;

    const commentElement = await Promise.all(
      commentList.map(async (comment) => {
        return {
          comment,
          tags: (await comment.tags).map((user) => user.id),
        };
      }),
    );

    const { results, errors } = await ContentMapper.toDomainEntity({
      elements: [
        {
          content,
          numLikes,
          likeList,
          numComments,
          commentElement: commentElement.at(0),
          referred,
        },
      ],
    });
    errors.forEach((error) => {
      this.logger.error(error);
    });
    return results[0] || null;
  }

  async findContentsByGroupIdAndType<T extends ContentTypeEnum>(payload: {
    groupId: string;
    contentTypeList: T[];
    pagination: ContentPaginationOptions;
  }): Promise<ContentByContentType<T>[]> {
    const contentTypeSet = new Set(payload.contentTypeList);
    const contentTypeList = Array.from(contentTypeSet); // 중복 제거

    const query = this.typeormContentRepository
      .createQueryBuilder("content")
      .innerJoin("content.group", "group")
      .where("group.id = :groupId", { groupId: payload.groupId })
      .andWhere("content.deletedDateTime is null")
      // .andWhere("content.contentType = :contentType", {
      //   contentType: payload.contentType,
      // })
      .andWhere(
        new Brackets((qb) => {
          contentTypeList.forEach((contentType, index) => {
            if (index === 0) {
              qb.where(`content.contentType = :contentType${index}`, {
                [`contentType${index}`]: contentType,
              });
            } else {
              qb.orWhere(`content.contentType = :contentType${index}`, {
                [`contentType${index}`]: contentType,
              });
            }
          });
        }),
      )
      .orderBy(
        `content.${payload.pagination.sortBy}`,
        payload.pagination.sortOrder === "asc" ? "ASC" : "DESC",
      )
      /**
       * https://orkhan.gitbook.io/typeorm/docs/select-query-builder
       * take and skip may look like we are using limit and offset, but they aren't.
       */
      .take(payload.pagination.limit);

    if (payload.pagination.cursor) {
      if (payload.pagination.sortOrder === "desc") {
        query.andWhere(`content.${payload.pagination.sortBy} < :cursor`, {
          cursor: payload.pagination.cursor,
        });
      } else {
        query.andWhere(`content.${payload.pagination.sortBy} > :cursor`, {
          cursor: payload.pagination.cursor,
        });
      }
    }

    const ormContentList = await query
      .leftJoinAndSelect("content.referred", "referred")
      .getMany();

    const mapperPayload = await Promise.all(
      ormContentList.map(async (content) => ({
        content,
        referred: await content.referred,
      })),
    );

    return this.ormEntityList2DomainEntityList({
      elements: mapperPayload,
    }) as unknown as ContentByContentType<T>[];
  }

  async findContentsByGroupMember(payload: {
    userId: string;
    groupId: string;
  }): Promise<Content[]> {
    const ormContentList = await this.typeormContentRepository
      .createQueryBuilder("content")
      .leftJoinAndSelect("content.referred", "referred")
      .where("content.ownerId = :userId", { userId: payload.userId })
      .andWhere("content.groupId = :groupId", { groupId: payload.groupId })
      .andWhere("content.deletedDateTime is null")
      .getMany();

    const mapperPayload = await Promise.all(
      ormContentList.map(async (content) => ({
        content,
        referred: await content.referred,
      })),
    );
    return this.ormEntityList2DomainEntityList({ elements: mapperPayload });
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
      .andWhere("comment.deletedDateTime is null")
      .orderBy("comment.createdDateTime", "DESC")
      .limit(limit)
      .leftJoinAndSelect("comment.tags", "tags")
      .getMany();
  }

  private async ormEntityList2DomainEntityList(payload: {
    elements: { content: TypeormContent; referred: TypeormContent[] }[];
  }): Promise<Content[]> {
    const { elements } = payload;
    const promiseList = elements.map(async ({ content, referred }) => {
      const [likeList, numLikes, commentList, numComments] = await Promise.all([
        this.getRecentLikeList(content.id, TypeormContentRepository.likeLimit),
        this.getNumLikes(content.id),
        this.getRecentCommentList(
          content.id,
          TypeormContentRepository.commentLimit,
        ),
        this.getNumComments(content.id),
      ]);

      return {
        content: content,
        numLikes,
        likeList,
        numComments,
        commentList,
        referred,
      };
    });
    const mapperPayload = await Promise.all(promiseList);

    const { results, errors } = await ContentMapper.toDomainEntity({
      elements: mapperPayload,
    });

    errors.forEach((error) => {
      this.logger.error(error);
    });
    return results;
  }
}
