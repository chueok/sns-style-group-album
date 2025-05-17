import { IUsecase } from '../../../common/usecase/usecase.interface';
import { ContentTypeEnum } from '../enum/content-type-enum';
import { IContentRepository } from '../repository/content-repository.interface';
import { ContentByContentType } from '../repository/type/content-type-mapping';
import { IGetContentListPort } from './port/get-content-list-port';

class GetContentListUsecaseFactory {
  public static create<T extends ContentTypeEnum>(contentTypeList: T[]) {
    return class
      implements IUsecase<IGetContentListPort, ContentByContentType<T>[]>
    {
      constructor(readonly contentRepository: IContentRepository) {}

      async execute(
        port: IGetContentListPort
      ): Promise<ContentByContentType<T>[]> {
        let contentList: ContentByContentType<T>[];

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
  [ContentTypeEnum.VIDEO, ContentTypeEnum.IMAGE]
) {}
