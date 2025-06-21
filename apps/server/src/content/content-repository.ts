import {
  Code,
  ContentId,
  EContentCategory,
  Exception,
  IContentRepository,
  IObjectStoragePort,
  Nullable,
  TMedia,
  TMediaPaginationParams,
  TMediaPaginationResult,
  UserId,
} from '@repo/be-core';
import { DataSource, Repository } from 'typeorm';
import { MediaMapper } from './mapper/media-mapper';
import { Inject, Logger, LoggerService, Optional } from '@nestjs/common';
import { v4, v6 } from 'uuid';
import { DiTokens } from '../di/di-tokens';
import { ServerConfig } from '../config/server-config';
import {
  TypeormContent,
  TypeormMedia,
} from '../infrastructure/persistence/typeorm/entity/content/typeorm-content.entity';
import { TypeormMember } from '../infrastructure/persistence/typeorm/entity/group/typeorm-member.entity';

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

  private readonly typeormGroupMemberRepository: Repository<TypeormMember>;
  private readonly typeormContentRepository: Repository<TypeormContent>;
  private readonly typeormMediaContentRepository: Repository<TypeormMedia>;

  private readonly bucketName: string;

  private readonly logger: LoggerService;

  constructor(
    dataSource: DataSource,
    @Inject(DiTokens.ObjectStorage)
    private readonly mediaObjectStorage: IObjectStoragePort,
    @Optional() logger?: LoggerService
  ) {
    this.typeormGroupMemberRepository = dataSource.getRepository(TypeormMember);
    this.typeormMediaContentRepository = dataSource.getRepository(TypeormMedia);
    this.typeormContentRepository = dataSource.getRepository(TypeormContent);

    this.bucketName = ServerConfig.OBJECT_STORAGE_MEDIA_BUCKET;

    this.logger = logger || new Logger(TypeormContentRepository.name);
  }

  async findMediaById(id: string): Promise<TMedia> {
    const result = await this.typeormMediaContentRepository.findOne({
      where: {
        id: id as ContentId,
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

  async isContentOwner(payload: {
    userId: string;
    contentId: string;
  }): Promise<boolean> {
    const result = await this.typeormContentRepository
      .createQueryBuilder('content')
      .leftJoin('content.owner', 'owner')
      .where('owner.userId = :userId', { userId: payload.userId })
      .andWhere('owner.status = :status', { status: 'approved' })
      .andWhere('content.id = :contentId', { contentId: payload.contentId })
      .andWhere('content.deletedDateTime is null')
      .getCount();

    return result > 0;
  }

  async hasAccessToContent(payload: {
    userId: string;
    contentId: string;
  }): Promise<boolean> {
    const result = await this.typeormContentRepository.count({
      where: {
        id: payload.contentId as ContentId,
        group: {
          members: { userId: payload.userId as UserId, status: 'approved' },
        },
      },
    });
    return result > 0;
  }

  /**
   * Typeorm Media entity의 url을 signed url로 변경
   */
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

        const newMedia = this.typeormMediaContentRepository.create({
          id: v6(),
          category,
          thumbnailRelativePath: key, // TODO: 썸네일 생성 필요.
          originalRelativePath: key,
          size,
          ext,
          mimeType,
          ownerId,
          groupId,
          createdDateTime: new Date(),
        });

        await this.typeormMediaContentRepository.save(newMedia);

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

    const queryBuilder = this.typeormMediaContentRepository
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

  async findMemberId(payload: {
    userId: string;
    groupId: string;
  }): Promise<Nullable<string>> {
    const queryBuilder = this.typeormGroupMemberRepository
      .createQueryBuilder('member')
      .where('member.groupId = :groupId', { groupId: payload.groupId })
      .andWhere('member.userId = :userId', { userId: payload.userId })
      .andWhere('member.status = :status', { status: 'approved' })
      .select(['member.id']);

    const result = await queryBuilder.getOne();

    return result?.id || null;
  }
}
