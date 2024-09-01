import {
  Content,
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

export class TypeormContentRepository implements IContentRepository {
  public static commentLimit = 5;
  public static likeLimit = 5;

  private readonly typeormContentRepository: Repository<TypeormContent>;
  private readonly typeormCommentRepository: Repository<TypeormComment>;
  private readonly typeormLikeRepository: Repository<TypeormLike>;

  constructor(dataSource: DataSource) {
    this.typeormContentRepository = dataSource.getRepository(TypeormContent);
    this.typeormCommentRepository = dataSource.getRepository(TypeormComment);
    this.typeormLikeRepository = dataSource.getRepository(TypeormLike);
  }

  // TODO 트랜잭션 처리 필요
  async createContent(content: Content): Promise<boolean> {
    const { content: ormContent, likeList } =
      ContentMapper.toOrmEntity(content);

    return Promise.all([
      this.typeormLikeRepository.save(likeList),
      this.typeormContentRepository.save(ormContent),
    ])
      .then(() => true)
      .catch(() => false);
  }

  async updateContent(content: Content): Promise<boolean> {
    const { content: ormContent, likeList } =
      ContentMapper.toOrmEntity(content);

    return Promise.all([
      this.typeormLikeRepository.save(likeList),
      this.typeormContentRepository.update(ormContent.id, ormContent),
    ])
      .then(() => true)
      .catch(() => false);
  }

  async findContentById(contentId: string): Promise<Nullable<Content>> {
    const elements = await this.getContentElements(contentId);
    if (!elements) {
      return null;
    }

    const { content, likeList, numLikes, commentList, numComments } = elements;
    return ContentMapper.toDomainEntity({
      content,
      numLikes,
      likeList,
      numComments,
      commentList,
    });
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

    if (payload.pagination.direction === "desc") {
      query.andWhere(`content.${payload.pagination.by} < :cursor`, {
        cursor: payload.pagination.cursor,
      });
    } else {
      query.andWhere(`content.${payload.pagination.by} > :cursor`, {
        cursor: payload.pagination.cursor,
      });
    }

    const ormContentList = await query.getMany();
    const contentList = await Promise.all(
      ormContentList.map(async (ormContent) => {
        const { likeList, numLikes, commentList, numComments } =
          await this.getContentElementsExceptContent(ormContent.id);

        return ContentMapper.toDomainEntity({
          content: ormContent,
          numLikes,
          likeList,
          numComments,
          commentList,
        });
      }),
    );

    return contentList.filter((content) => content !== null);
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

    const domainContentList = await Promise.all(
      ormContentList.map(async (ormContent) => {
        const { likeList, numLikes, commentList, numComments } =
          await this.getContentElementsExceptContent(ormContent.id);

        return ContentMapper.toDomainEntity({
          content: ormContent,
          numLikes,
          likeList,
          numComments,
          commentList,
        });
      }),
    );
    return domainContentList.filter((content) => content !== null);
  }

  private async getContentElements(contentId: string) {
    const [content, likeList, numLikes, commentList, numComments] =
      await Promise.all([
        this.typeormContentRepository.findOne({
          where: { id: contentId },
        }),
        this.typeormLikeRepository
          .createQueryBuilder("like")
          .innerJoinAndSelect("like.content", "content")
          .where("content.id = :contentId", { contentId })
          .orderBy("like.createdDateTime", "DESC")
          .limit(TypeormContentRepository.likeLimit)
          .getMany(),
        this.typeormLikeRepository
          .createQueryBuilder("like")
          .innerJoinAndSelect("like.content", "content")
          .where("content.id = :contentId", { contentId })
          .getCount(),
        this.typeormCommentRepository
          .createQueryBuilder("comment")
          .innerJoinAndSelect("comment.content", "content")
          .where("content.id = :contentId", { contentId })
          .orderBy("comment.createdDateTime", "DESC")
          .limit(TypeormContentRepository.commentLimit)
          .getMany(),
        this.typeormCommentRepository
          .createQueryBuilder("comment")
          .innerJoinAndSelect("comment.content", "content")
          .where("content.id = :contentId", { contentId })
          .getCount(),
      ]);

    if (!content) {
      return null;
    }
    return { content, likeList, numLikes, commentList, numComments };
  }

  private async getContentElementsExceptContent(contentId: string) {
    const [likeList, numLikes, commentList, numComments] = await Promise.all([
      this.typeormLikeRepository
        .createQueryBuilder("like")
        .innerJoinAndSelect("like.content", "content")
        .where("content.id = :contentId", { contentId })
        .orderBy("like.createdDateTime", "DESC")
        .limit(TypeormContentRepository.likeLimit)
        .getMany(),
      this.typeormLikeRepository
        .createQueryBuilder("like")
        .innerJoinAndSelect("like.content", "content")
        .where("content.id = :contentId", { contentId })
        .getCount(),
      this.typeormCommentRepository
        .createQueryBuilder("comment")
        .innerJoinAndSelect("comment.content", "content")
        .where("content.id = :contentId", { contentId })
        .orderBy("comment.createdDateTime", "DESC")
        .limit(TypeormContentRepository.commentLimit)
        .getMany(),
      this.typeormCommentRepository
        .createQueryBuilder("comment")
        .innerJoinAndSelect("comment.content", "content")
        .where("content.id = :contentId", { contentId })
        .getCount(),
    ]);
    return { likeList, numLikes, commentList, numComments };
  }
}
