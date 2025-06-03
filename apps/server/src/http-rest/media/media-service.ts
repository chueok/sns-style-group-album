import {
  Inject,
  Injectable,
  Logger,
  LoggerService,
  Optional,
} from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { TypeormTemporaryContent } from '../../infrastructure/persistence/typeorm/entity/content/typeorm-temporary-content.entity';
import {
  ContentId,
  EContentCategory,
  GroupId,
  IObjectStoragePort,
  UserId,
} from '@repo/be-core';
import { v4 } from 'uuid';
import { TypeormMedia } from '../../infrastructure/persistence/typeorm/entity/content/typeorm-content.entity';
import { ISaveTemporaryMediaPort } from './port/save-temporary-media-port';
import { IConfirmOriginalMediaUploadedPort } from './port/confirm-original-media-uploaded-port';
import { IConfirmResponsiveMediaUploadedPort } from './port/confirm-responsive-media-uploaded-port';
import { ObjectStorageKeyFactory } from '../../infrastructure/persistence/object-storage/key-factory/object-storage-key-factory';
import { DiTokens } from '../../di/di-tokens';
import { ServerConfig } from '../../config/server-config';

@Injectable()
export class MediaService {
  private readonly temporaryContentRepository: Repository<TypeormTemporaryContent>;
  private readonly contentRepository: Repository<TypeormMedia>;

  private readonly bucketName: string;
  private readonly logger: LoggerService;
  constructor(
    readonly dataSource: DataSource,
    @Inject(DiTokens.MediaObjectStorage)
    private readonly mediaObjectStorage: IObjectStoragePort,
    @Optional() logger?: LoggerService
  ) {
    this.temporaryContentRepository = dataSource.getRepository(
      TypeormTemporaryContent
    );
    this.contentRepository = dataSource.getRepository(TypeormMedia);

    this.bucketName = ServerConfig.OBJECT_STORAGE_MEDIA_BUCKET;

    this.logger = logger || new Logger(MediaService.name);
  }

  public async saveTemporaryMedia(
    payload: ISaveTemporaryMediaPort
  ): Promise<string> {
    const temporaryContent = new TypeormTemporaryContent();
    temporaryContent.id = v4();
    temporaryContent.groupId = payload.groupId;
    temporaryContent.ownerId = payload.ownerId;
    await this.temporaryContentRepository.save(temporaryContent);

    const mediaUploadUrl = ObjectStorageKeyFactory.getOriginalPath(
      temporaryContent.groupId,
      temporaryContent.id
    );

    return this.mediaObjectStorage.getPresignedUrlForUpload(
      this.bucketName,
      mediaUploadUrl
    );
  }

  public async confirmOriginalMediaUploaded(
    payload: IConfirmOriginalMediaUploadedPort
  ): Promise<void> {
    const tempContent = await this.temporaryContentRepository.findOneBy({
      id: payload.id,
    });
    if (!tempContent) {
      this.logger.error(
        `tempContent not found: ${payload.id}, check media upload process`
      );
      return;
    }

    const content = new TypeormMedia();
    content.id = payload.id as ContentId;
    content.groupId = tempContent.groupId as GroupId;
    content.ownerId = tempContent.ownerId as UserId;
    content.originalRelativePath = payload.originalRelativePath;
    content.size = payload.size;
    content.ext = payload.ext;
    content.mimetype = payload.mimetype;
    if (content.mimetype.startsWith('image/')) {
      content.contentType = EContentCategory.IMAGE;
    } else if (content.mimetype.startsWith('video/')) {
      content.contentType = EContentCategory.VIDEO;
    } else {
      this.logger.error(`unsupported mimetype: ${content.mimetype}`);
      return;
    }

    await Promise.all([
      this.contentRepository.save(content),
      this.temporaryContentRepository.delete(tempContent.id),
    ]);

    return;
  }

  public async confirmResponsiveMediaUploaded(
    payload: IConfirmResponsiveMediaUploadedPort
  ): Promise<void> {
    const content = await this.contentRepository.findOneBy({
      id: payload.id as ContentId,
    });
    if (!content) {
      this.logger.error(`content not found: ${payload.id}`);
      return;
    }
    if (!(content instanceof TypeormMedia)) {
      this.logger.error(`content is not media: ${payload.id}`);
      return;
    }

    const updateObj: Omit<IConfirmResponsiveMediaUploadedPort, 'id'> = {};
    if (payload.thumbnailRelativePath) {
      updateObj.thumbnailRelativePath = payload.thumbnailRelativePath;
    }
    if (payload.largeRelativePath) {
      updateObj.largeRelativePath = payload.largeRelativePath;
    }
    if (Object.keys(updateObj).length === 0) {
      return;
    }
    await this.contentRepository.update(content.id, updateObj);
  }
}
