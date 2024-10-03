import { Nullable } from "../../../common/type/common-types";
import { Content } from "../entity/content.abstract";
import { ContentTypeEnum } from "../enum/content-type-enum";
import { ContentPaginationOptions } from "./type/content-pagination-options";
import { ContentByContentType } from "./type/content-type-mapping";

export interface IContentRepository {
  createContent(content: Content): Promise<boolean>;

  updateContent(content: Content): Promise<boolean>;

  findContentById(contentId: string): Promise<Nullable<Content>>;

  findContentsByGroupIdAndType<T extends ContentTypeEnum>(payload: {
    groupId: string;
    contentTypeList: T[];
    pagination: ContentPaginationOptions;
  }): Promise<ContentByContentType<T>[]>;

  findContentsByGroupMember(payload: {
    userId: string;
    groupId: string;
  }): Promise<Content[]>;

  // delete is not supported
}
