import {
  Code,
  ContentId,
  EContentCategory,
  Exception,
  IContentRepository,
  Nullable,
  TMedia,
  TMediaPaginationParams,
  TMediaPaginationResult,
  UserId,
} from '@repo/be-core';
import { DataSource, Repository } from 'typeorm';
import { MediaMapper } from './mapper/media-mapper';
import { Logger, LoggerService, Optional } from '@nestjs/common';
import { v6 } from 'uuid';
import { TypeormContent } from '../../typeorm/entity/content/typeorm-content.entity';
import { TypeormMedia } from '../../typeorm/entity/content/typeorm-content.entity';
import { TypeormMember } from '../../typeorm/entity/group/typeorm-member.entity';

export class TypeormContentRepository implements IContentRepository {
  public static commentLimit = 5;
  public static likeLimit = 5;

  private readonly typeormGroupMemberRepository: Repository<TypeormMember>;
  private readonly typeormContentRepository: Repository<TypeormContent>;
  private readonly typeormMediaContentRepository: Repository<TypeormMedia>;

  private readonly logger: LoggerService;

  constructor(dataSource: DataSource, @Optional() logger?: LoggerService) {
    this.typeormGroupMemberRepository = dataSource.getRepository(TypeormMember);
    this.typeormMediaContentRepository = dataSource.getRepository(TypeormMedia);
    this.typeormContentRepository = dataSource.getRepository(TypeormContent);

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

    return MediaMapper.toDomainEntity(result);
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

  async createMedia(payload: {
    groupId: string;
    ownerId: string;
    media: {
      thumbnailPath: string;
      originalPath: string;
      largePath?: string;
      size: number;
      ext: string;
      mimeType: string;
    }[];
  }): Promise<void> {
    const { groupId, ownerId, media } = payload;

    const newMediaList = media.map(
      ({ size, ext, mimeType, thumbnailPath, originalPath, largePath }) => {
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
          thumbnailRelativePath: thumbnailPath,
          originalRelativePath: originalPath,
          largeRelativePath: largePath,
          size,
          ext,
          mimeType,
          ownerId,
          groupId,
          createdDateTime: new Date(),
        });

        return newMedia;
      }
    );

    await this.typeormMediaContentRepository.save(newMediaList);

    return;
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
    const nextCursor = ormContentList.at(-1)?.id || undefined;
    const items = MediaMapper.toDomainEntityList(ormContentList);
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
