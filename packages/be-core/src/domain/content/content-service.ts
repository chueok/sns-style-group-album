import { IContentRepository } from './content-repository.interface';

export class ContentService {
  constructor(private readonly contentRepository: IContentRepository) {}
}
