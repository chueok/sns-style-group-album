import {
  ContentService,
  IContentRepository,
  IObjectStoragePort,
} from '@repo/be-core';
import { TypeormContentRepository } from './content-repository';
import { DiTokens } from './di-tokens';
import { Module, Provider } from '@nestjs/common';
import { DiTokens as CommonDiTokens } from '../../adapter/di-tokens';

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
      return new ContentService(contentRepository, objectStorage);
    },
    inject: [DiTokens.ContentRepository, CommonDiTokens.ObjectStorage],
  },
];

@Module({
  providers: [...providers],
  exports: [ContentService, DiTokens.ContentRepository],
})
export class ContentModule {}
