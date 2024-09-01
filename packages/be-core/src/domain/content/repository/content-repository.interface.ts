import { Nullable } from "../../../common/type/common-types";
import { Content } from "../entity/content.abstract";
import { ContentTypeEnum } from "../enum/content-type-enum";

export type ContentPagenationType = {
  cursor: Date;
  by: "createdDateTime";
  direction: "asc" | "desc";
  limit: number;
};

export interface IContentRepository {
  createContent(content: Content): Promise<boolean>;

  updateContent(content: Content): Promise<boolean>;

  findContentById(contentId: string): Promise<Nullable<Content>>;

  findContentsByGroupIdAndType(payload: {
    groupId: string;
    contentType: ContentTypeEnum;
    pagination: ContentPagenationType;
  }): Promise<Content[]>;

  findContentsByGroupMember(payload: {
    userId: string;
    groupId: string;
  }): Promise<Content[]>;

  // delete is not supported
}
