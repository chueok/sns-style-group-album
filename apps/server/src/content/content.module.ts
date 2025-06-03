import {
  ContentService,
  IContentRepository,
  IObjectStoragePort,
} from '@repo/be-core';
import { TypeormContentRepository } from '../infrastructure/persistence/typeorm/repository/content/content-repository';
import { DiTokens } from './di-tokens';
import { ServerConfig } from '../config/server-config';
import { Module, Provider } from '@nestjs/common';

import { DiTokens as MediaDiTokens } from '../di/di-tokens';

const providers: Provider[] = [
  {
    provide: DiTokens.ContentRepository,
    useClass: TypeormContentRepository,
  },
  {
    provide: ContentService,
    useFactory: (
      contentRepository: IContentRepository,
      objectStorage: IObjectStoragePort
    ) => {
      return new ContentService(
        contentRepository,
        objectStorage,
        ServerConfig.OBJECT_STORAGE_MEDIA_BUCKET
      );
    },
    inject: [DiTokens.ContentRepository, MediaDiTokens.MediaObjectStorage],
  },
];

@Module({
  providers: [...providers],
  exports: [ContentService, DiTokens.ContentRepository],
})
export class ContentModule {}
