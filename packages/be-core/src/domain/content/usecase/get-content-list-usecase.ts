import { IUsecase } from '../../../common/usecase/usecase.interface';
import { EContentCategory } from '../type/content-category';
import { IContentRepository } from '../content-repository.interface';

import { IGetContentListPort } from './port/get-content-list-port';
import { ContentByContentCategory } from '../type/content-category-mapping';

class GetContentListUsecaseFactory {
  public static create<T extends EContentCategory>(contentTypeList: T[]) {
    return class
      implements IUsecase<IGetContentListPort, ContentByContentCategory<T>[]>
    {
      constructor(readonly contentRepository: IContentRepository) {}

      async execute(
        port: IGetContentListPort
      ): Promise<ContentByContentCategory<T>[]> {
        let contentList: ContentByContentCategory<T>[];

        switch (port.sortBy) {
          case 'createdDateTime':
            contentList =
              await this.contentRepository.findContentsByGroupIdAndType({
                groupId: port.groupId,
                contentTypeList: contentTypeList,
                pagination: {
                  cursor: port.cursor ? new Date(port.cursor) : undefined,
                  limit: port.limit,
                  sortBy: port.sortBy,
                  sortOrder: port.sortOrder,
                },
              });
            break;
        }

        return contentList || [];
      }
    };
  }
}

export class GetMediaContentListUsecase extends GetContentListUsecaseFactory.create(
  [EContentCategory.VIDEO, EContentCategory.IMAGE]
) {}
