import { ContentService, IContentRepository } from '@repo/be-core';
import { TypeormContentRepository } from './content-repository';
import { DiTokens } from './di-tokens';
import { Module, Provider } from '@nestjs/common';

const providers: Provider[] = [
  {
    provide: DiTokens.ContentRepository,
    useClass: TypeormContentRepository,
  },
  {
    provide: ContentService,
    useFactory: (contentRepository: IContentRepository) => {
      return new ContentService(contentRepository);
    },
    inject: [DiTokens.ContentRepository],
  },
];

@Module({
  providers: [...providers],
  exports: [ContentService, DiTokens.ContentRepository],
})
export class ContentModule {}
