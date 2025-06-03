import { EContentCategory } from '../..';
import { Nullable } from '../../common/type/common-types';
import { Content } from './entity/content.abstract';
import { ContentPaginationOptions } from './type/content-pagination-options';
import { ContentByContentCategory } from './type/content-category-mapping';

export interface IContentRepository {
  createContent(content: Content): Promise<boolean>;

  updateContent(content: Content): Promise<boolean>;

  findContentById(contentId: string): Promise<Nullable<Content>>;

  findContentsByGroupIdAndType<T extends EContentCategory>(payload: {
    groupId: string;
    contentTypeList: T[];
    pagination: ContentPaginationOptions;
  }): Promise<ContentByContentCategory<T>[]>;

  findContentsByGroupMember(payload: {
    userId: string;
    groupId: string;
  }): Promise<Content[]>;

  isGroupMember(payload: { userId: string; groupId: string }): Promise<boolean>;

  // delete is not supported
}
