import { Code } from '../../../common/exception/code';
import { Exception } from '../../../common/exception/exception';
import { IUsecase } from '../../../common/usecase/usecase.interface';
import { IContentRepository } from '../repository/content-repository.interface';
import { IDeleteContentPort } from './port/delete-content-port';

export class DeleteContentUsecase
  implements IUsecase<IDeleteContentPort, void>
{
  constructor(private readonly contentRepository: IContentRepository) {}
  async execute(port: IDeleteContentPort): Promise<void> {
    const content = await this.contentRepository.findContentById(
      port.contentId
    );
    if (!content) {
      throw Exception.new({
        code: Code.ENTITY_NOT_FOUND_ERROR,
        overrideMessage: 'content is not exist',
      });
    }

    const domainResult = await content.deleteContent();
    if (!domainResult) {
      throw Exception.new({
        code: Code.INTERNAL_ERROR,
        overrideMessage: 'delete content failed',
      });
    }

    const repositoryResult =
      await this.contentRepository.updateContent(content);
    if (!repositoryResult) {
      throw Exception.new({
        code: Code.INTERNAL_ERROR,
        overrideMessage: 'update content failed',
      });
    }

    return;
  }
}
