import {
  Code,
  EContentCategory,
  Exception,
  IContentRepository,
  IObjectStoragePort,
  TMedia,
  TMediaPaginationParams,
  TMediaPaginationResult,
  UserId,
} from '@repo/be-core';
import { DataSource, Repository } from 'typeorm';
import { TypeormContent } from '../infrastructure/persistence/typeorm/entity/content/typeorm-content.entity';
import { TypeormComment } from '../infrastructure/persistence/typeorm/entity/comment/typeorm-comment.entity';
import { TypeormLike } from '../infrastructure/persistence/typeorm/entity/like/typeorm-like.entity';
import { MediaMapper } from './mapper/content-mapper';
import { Inject, Logger, LoggerService, Optional } from '@nestjs/common';
import { TypeormGroup } from '../infrastructure/persistence/typeorm/entity/group/typeorm-group.entity';
import { v4, v6 } from 'uuid';
import { DiTokens } from '../di/di-tokens';
import { ServerConfig } from '../config/server-config';
import { TypeormMedia } from '../infrastructure/persistence/typeorm/entity/media/typeorm-media.entity';

const generateKey = (payload: {
  groupId: string;
  ownerId: string;
  fileName: string;
}): string => {
  return `${payload.groupId}/${payload.ownerId}/${payload.fileName}`;
};

export class TypeormContentRepository implements IContentRepository {
  public static commentLimit = 5;
  public static likeLimit = 5;

  private readonly typeormContentRepository: Repository<TypeormContent>;
  private readonly typeormMediaRepository: Repository<TypeormMedia>;
  private readonly typeormCommentRepository: Repository<TypeormComment>;
  private readonly typeormLikeRepository: Repository<TypeormLike>;
  private readonly typeormGroupRepository: Repository<TypeormGroup>;

  private readonly bucketName: string;

  private readonly logger: LoggerService;

  constructor(
    dataSource: DataSource,
    @Inject(DiTokens.ObjectStorage)
    private readonly mediaObjectStorage: IObjectStoragePort,
    @Optional() logger?: LoggerService
  ) {
    this.typeormContentRepository = dataSource.getRepository(TypeormContent);
    this.typeormMediaRepository = dataSource.getRepository(TypeormMedia);
    this.typeormCommentRepository = dataSource.getRepository(TypeormComment);
    this.typeormLikeRepository = dataSource.getRepository(TypeormLike);
    this.typeormGroupRepository = dataSource.getRepository(TypeormGroup);

    this.bucketName = ServerConfig.OBJECT_STORAGE_MEDIA_BUCKET;

    this.logger = logger || new Logger(TypeormContentRepository.name);
  }

  async findMediaById(id: string): Promise<TMedia> {
    const result = await this.typeormMediaRepository.findOne({
      where: {
        id,
      },
    });
    if (!result) {
      throw Exception.new({
        code: Code.UTIL_NOT_FOUND_ERROR,
        overrideMessage: 'Media not found',
      });
    }

    const resolved = await this.resolveSignedUrl(result);

    return MediaMapper.toDomainEntity(resolved);
  }
  async isMediaOwner(payload: {
    userId: string;
    mediaId: string;
  }): Promise<boolean> {
    const result = await this.typeormMediaRepository.count({
      where: {
        ownerId: payload.userId as UserId,
        id: payload.mediaId,
      },
    });
    return result > 0;
  }
  async hasAccessToMedia(payload: {
    userId: string;
    mediaId: string;
  }): Promise<boolean> {
    const result = await this.typeormMediaRepository.count({
      where: {
        id: payload.mediaId,
        group: {
          members: { id: payload.userId as UserId },
        },
      },
    });
    return result > 0;
  }

  private async resolveSignedUrl(entity: TypeormMedia): Promise<TypeormMedia> {
    if (entity.originalRelativePath) {
      entity.originalRelativePath =
        await this.mediaObjectStorage.getPresignedUrlForDownload(
          this.bucketName,
          entity.originalRelativePath
        );
    }
    if (entity.thumbnailRelativePath) {
      entity.thumbnailRelativePath =
        await this.mediaObjectStorage.getPresignedUrlForDownload(
          this.bucketName,
          entity.thumbnailRelativePath
        );
    }
    if (entity.largeRelativePath) {
      entity.largeRelativePath =
        await this.mediaObjectStorage.getPresignedUrlForDownload(
          this.bucketName,
          entity.largeRelativePath
        );
    }
    return entity;
  }

  private async resolveSignedUrlList(
    entityList: TypeormMedia[]
  ): Promise<TypeormMedia[]> {
    const result = await Promise.allSettled(
      entityList.map((entity) => this.resolveSignedUrl(entity))
    );

    result.map((result) => {
      if (result.status === 'rejected') {
        console.error({ result: result.reason });
      }
    });
    return result
      .map((result) => (result.status === 'fulfilled' ? result.value : null))
      .filter((result) => result !== null);
  }

  async createMediaUploadUrls(payload: {
    groupId: string;
    ownerId: string;
    media: {
      size: number;
      ext: string;
      mimeType: string;
    }[];
  }): Promise<string[]> {
    const { groupId, ownerId, media } = payload;

    const result = await Promise.all(
      media.map(async ({ size, ext, mimeType }) => {
        const fileName = v4();

        const key = generateKey({
          groupId,
          ownerId,
          fileName,
        });

        let category: EContentCategory;
        if (mimeType.startsWith('image/')) {
          category = EContentCategory.IMAGE;
        } else if (mimeType.startsWith('video/')) {
          category = EContentCategory.VIDEO;
        } else {
          throw Exception.new({
            code: Code.INTERNAL_ERROR,
            overrideMessage: 'Invalid mime type',
          });
        }

        const newMedia = this.typeormMediaRepository.create({
          id: v6(),
          category,
          originalRelativePath: key,
          size,
          ext,
          mimeType,
          ownerId,
          groupId,
          createdDateTime: new Date(),
        });

        await this.typeormMediaRepository.save(newMedia);

        const url = await this.mediaObjectStorage.getPresignedUrlForUpload(
          this.bucketName,
          key // TODO: 몇 초 동안 유효하게 할지 결정 필요.
        );

        return url;
      })
    );

    return result;
  }

  async findMediaInGroupOrderByCreated(payload: {
    groupId: string;
    pagination: TMediaPaginationParams;
  }): Promise<TMediaPaginationResult<TMedia>> {
    const { groupId, pagination } = payload;

    const queryBuilder = this.typeormMediaRepository
      .createQueryBuilder('content')
      .leftJoin('content.group', 'group')
      .where('group.id = :groupId', { groupId })
      .andWhere('content.deletedDateTime is null')
      .orderBy(`content.id`, pagination.sortOrder === 'asc' ? 'ASC' : 'DESC') // id를 uuidv1을 사용하여 시간순 정렬이 가능하도록 함
      .take(pagination.limit);

    if (pagination.cursor) {
      if (pagination.sortOrder === 'desc') {
        queryBuilder.andWhere(`content.id < :cursor`, {
          cursor: pagination.cursor,
        });
      } else {
        queryBuilder.andWhere(`content.id > :cursor`, {
          cursor: pagination.cursor,
        });
      }
    }

    const ormContentList = await queryBuilder.getMany();
    const resolvedList = await this.resolveSignedUrlList(ormContentList);
    const nextCursor = resolvedList.at(-1)?.id || undefined;
    const items = MediaMapper.toDomainEntityList(resolvedList);
    return {
      items,
      sortOrder: pagination.sortOrder,
      nextCursor,
    };
  }

  async isGroupMember(payload: {
    userId: string;
    groupId: string;
  }): Promise<boolean> {
    const { groupId, userId } = payload;
    const queryBuilder = this.typeormGroupRepository
      .createQueryBuilder('group')
      .leftJoin('group.members', 'members')
      .where('group.id = :groupId', { groupId })
      .andWhere('members.id = :userId', { userId });

    const result = await queryBuilder.getCount();

    return result > 0;
  }

  // TODO 트랜잭션 처리 필요
  // 중요한 문제가 생기는건 아닌데, 트랜젝션 안하는게 나을까?
  // async createContent(content: Content): Promise<boolean> {
  //   const { results, errors } = ContentMapper.toOrmEntity({
  //     elements: [content],
  //   });
  //   errors.forEach((error) => {
  //     this.logger.error(error);
  //   });
  //   if (results.length === 0) {
  //     return false;
  //   }

  //   const promiseList = results.map(async (result) => {
  //     return Promise.all([
  //       this.typeormLikeRepository.save(result.likeList),
  //       this.typeormContentRepository.save(result.content),
  //     ]);
  //   });

  //   return Promise.all(promiseList)
  //     .then(() => true)
  //     .catch(() => false);
  // }

  // async updateContent(content: Content): Promise<boolean> {
  //   const { results, errors } = ContentMapper.toOrmEntity({
  //     elements: [content],
  //   });
  //   errors.forEach((error) => {
  //     this.logger.error(error);
  //   });
  //   if (results.length === 0) {
  //     return false;
  //   }

  //   const promiseList = results.map(async (result) => {
  //     return Promise.all([
  //       this.typeormLikeRepository.save(result.likeList),
  //       this.typeormContentRepository.update(result.content.id, result.content),
  //     ]);
  //   });

  //   return Promise.all(promiseList)
  //     .then(() => true)
  //     .catch(() => false);
  // }

  // async findContentById(contentId: ContentId): Promise<Nullable<Content>> {
  //   const [content, likeList, numLikes, commentList, numComments] =
  //     await Promise.all([
  //       this.typeormContentRepository
  //         .createQueryBuilder('content')
  //         .leftJoinAndSelect('content.referred', 'referred')
  //         .where('content.id = :contentId', { contentId })
  //         .andWhere('content.deletedDateTime is null')
  //         .getOne(),
  //       this.getRecentLikeList(contentId, TypeormContentRepository.likeLimit),
  //       this.getNumLikes(contentId),
  //       this.getRecentCommentList(
  //         contentId,
  //         TypeormContentRepository.commentLimit
  //       ),
  //       this.getNumComments(contentId),
  //     ]);
  //   if (!content) {
  //     return null;
  //   }
  //   const referred = await content.referred;

  //   const commentElement = await Promise.all(
  //     commentList.map(async (comment) => {
  //       return {
  //         comment,
  //         tags: await comment.tags,
  //       };
  //     })
  //   );

  //   const { results, errors } = await ContentMapper.toDomainEntity({
  //     elements: [
  //       {
  //         content,
  //         numLikes,
  //         likeList,
  //         numComments,
  //         commentElement: commentElement.at(0),
  //         referred,
  //       },
  //     ],
  //   });
  //   errors.forEach((error) => {
  //     this.logger.error(error);
  //   });
  //   return results[0] || null;
  // }

  // async findContentsByGroupIdAndType<T extends EContentCategory>(payload: {
  //   groupId: string;
  //   contentTypeList: T[];
  //   pagination: ContentPaginationOptions;
  // }): Promise<ContentByContentCategory<T>[]> {
  //   const contentTypeSet = new Set(payload.contentTypeList);
  //   const contentTypeList = Array.from(contentTypeSet); // 중복 제거

  //   const query = this.typeormContentRepository
  //     .createQueryBuilder('content')
  //     .innerJoin('content.group', 'group')
  //     .where('group.id = :groupId', { groupId: payload.groupId })
  //     .andWhere('content.deletedDateTime is null')
  //     // .andWhere("content.contentType = :contentType", {
  //     //   contentType: payload.contentType,
  //     // })
  //     .andWhere(
  //       new Brackets((qb) => {
  //         contentTypeList.forEach((contentType, index) => {
  //           if (index === 0) {
  //             qb.where(`content.contentType = :contentType${index}`, {
  //               [`contentType${index}`]: contentType,
  //             });
  //           } else {
  //             qb.orWhere(`content.contentType = :contentType${index}`, {
  //               [`contentType${index}`]: contentType,
  //             });
  //           }
  //         });
  //       })
  //     )
  //     .orderBy(
  //       `content.${payload.pagination.sortBy}`,
  //       payload.pagination.sortOrder === 'asc' ? 'ASC' : 'DESC'
  //     )
  //     /**
  //      * https://orkhan.gitbook.io/typeorm/docs/select-query-builder
  //      * take and skip may look like we are using limit and offset, but they aren't.
  //      */
  //     .take(payload.pagination.limit);

  //   if (payload.pagination.cursor) {
  //     if (payload.pagination.sortOrder === 'desc') {
  //       query.andWhere(`content.${payload.pagination.sortBy} < :cursor`, {
  //         cursor: payload.pagination.cursor,
  //       });
  //     } else {
  //       query.andWhere(`content.${payload.pagination.sortBy} > :cursor`, {
  //         cursor: payload.pagination.cursor,
  //       });
  //     }
  //   }

  //   const ormContentList = await query
  //     .leftJoinAndSelect('content.referred', 'referred')
  //     .getMany();

  //   const mapperPayload = await Promise.all(
  //     ormContentList.map(async (content) => ({
  //       content,
  //       referred: await content.referred,
  //     }))
  //   );

  //   return this.ormEntityList2DomainEntityList({
  //     elements: mapperPayload,
  //   }) as unknown as ContentByContentCategory<T>[];
  // }

  // async findContentsByGroupMember(payload: {
  //   userId: string;
  //   groupId: string;
  // }): Promise<Content[]> {
  //   const ormContentList = await this.typeormContentRepository
  //     .createQueryBuilder('content')
  //     .leftJoinAndSelect('content.referred', 'referred')
  //     .where('content.ownerId = :userId', { userId: payload.userId })
  //     .andWhere('content.groupId = :groupId', { groupId: payload.groupId })
  //     .andWhere('content.deletedDateTime is null')
  //     .getMany();

  //   const mapperPayload = await Promise.all(
  //     ormContentList.map(async (content) => ({
  //       content,
  //       referred: await content.referred,
  //     }))
  //   );
  //   return this.ormEntityList2DomainEntityList({ elements: mapperPayload });
  // }

  // private async getNumLikes(contentId: string): Promise<number> {
  //   return this.typeormLikeRepository
  //     .createQueryBuilder('like')
  //     .where('like.contentId = :contentId', { contentId })
  //     .getCount();
  // }

  // private async getRecentLikeList(
  //   contentId: string,
  //   limit: number
  // ): Promise<TypeormLike[]> {
  //   return this.typeormLikeRepository
  //     .createQueryBuilder('like')
  //     .where('like.contentId = :contentId', { contentId })
  //     .orderBy('like.createdDateTime', 'DESC')
  //     .limit(limit)
  //     .getMany();
  // }

  // private async getNumComments(contentId: string): Promise<number> {
  //   return this.typeormCommentRepository
  //     .createQueryBuilder('comment')
  //     .where('comment.contentId = :contentId', { contentId })
  //     .getCount();
  // }

  // private async getRecentCommentList(
  //   contentId: string,
  //   limit: number
  // ): Promise<TypeormComment[]> {
  //   return this.typeormCommentRepository
  //     .createQueryBuilder('comment')
  //     .where('comment.contentId = :contentId', { contentId })
  //     .andWhere('comment.deletedDateTime is null')
  //     .orderBy('comment.createdDateTime', 'DESC')
  //     .limit(limit)
  //     .leftJoinAndSelect('comment.tags', 'tags')
  //     .getMany();
  // }

  // private async ormEntityList2DomainEntityList(payload: {
  //   elements: { content: TypeormContent; referred: TypeormContent[] }[];
  // }): Promise<Content[]> {
  //   const { elements } = payload;
  //   const promiseList = elements.map(async ({ content, referred }) => {
  //     const [likeList, numLikes, commentList, numComments] = await Promise.all([
  //       this.getRecentLikeList(content.id, TypeormContentRepository.likeLimit),
  //       this.getNumLikes(content.id),
  //       this.getRecentCommentList(
  //         content.id,
  //         TypeormContentRepository.commentLimit
  //       ),
  //       this.getNumComments(content.id),
  //     ]);

  //     return {
  //       content: content,
  //       numLikes,
  //       likeList,
  //       numComments,
  //       commentList,
  //       referred,
  //     };
  //   });
  //   const mapperPayload = await Promise.all(promiseList);

  //   const { results, errors } = await ContentMapper.toDomainEntity({
  //     elements: mapperPayload,
  //   });

  //   errors.forEach((error) => {
  //     this.logger.error(error);
  //   });
  //   return results;
  // }
}
