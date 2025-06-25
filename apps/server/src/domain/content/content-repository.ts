import {
  Code,
  ContentId,
  EContentCategory,
  Exception,
  IContentRepository,
  Nullable,
  TContentMember,
  TMedia,
  TMediaPaginationParams,
  TMediaPaginationResult,
} from '@repo/be-core';
import { DataSource, Repository } from 'typeorm';
import { MediaMapper } from './mapper/media-mapper';
import { Logger, LoggerService, Optional } from '@nestjs/common';
import { v6 } from 'uuid';
import { TypeormContent } from '../../typeorm/entity/content/typeorm-content.entity';
import { TypeormMedia } from '../../typeorm/entity/content/typeorm-content.entity';
import { TypeormMember } from '../../typeorm/entity/group/typeorm-member.entity';
import { ContentMemberMapper } from './mapper/content-member-mapper';

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

  async findApprovedMember(payload: {
    userId: string;
    groupId: string;
  }): Promise<Nullable<TContentMember>> {
    const queryBuilder = this.typeormGroupMemberRepository
      .createQueryBuilder('member')
      .where('member.groupId = :groupId', { groupId: payload.groupId })
      .andWhere('member.userId = :userId', { userId: payload.userId })
      .andWhere('member.status = :status', { status: 'approved' })
      .select(['member.id', 'member.groupId']);

    const result = await queryBuilder.getOne();
    if (!result) {
      return null;
    }

    return ContentMemberMapper.toDomainEntity(result);
  }

  async findContentOwner(payload: {
    contentId: string;
  }): Promise<Nullable<TContentMember>> {
    const queryBuilder = this.typeormContentRepository
      .createQueryBuilder('content')
      .leftJoin('content.owner', 'owner')
      .andWhere('content.id = :contentId', { contentId: payload.contentId })
      .andWhere('content.deletedDateTime is null')
      .select(['owner.id', 'owner.groupId']);

    const result = await queryBuilder.getOne();
    if (!result) {
      return null;
    }

    if (!result.__owner__) {
      throw Exception.new({
        code: Code.INTERNAL_ERROR,
        overrideMessage: 'sql query is invalid. Content owner not found',
      });
    }

    return ContentMemberMapper.toDomainEntity(result.__owner__);
  }

  async findMediaById(id: string): Promise<Nullable<TMedia>> {
    const result = await this.typeormMediaContentRepository.findOne({
      where: {
        id: id as ContentId,
      },
    });

    if (!result) {
      return null;
    }

    return MediaMapper.toDomainEntity(result);
  }

  async findMediaListBy(
    payload: {
      groupId: string;
    },
    pagination: TMediaPaginationParams
  ): Promise<TMediaPaginationResult<TMedia>> {
    const { groupId } = payload;

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
}
