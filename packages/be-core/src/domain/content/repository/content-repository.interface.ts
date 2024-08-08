import { Nullable } from "src/common/type/common-types";
import { Content } from "../entity/content.abstract";

export interface IContentRepository {
  createContent(content: Content): Promise<Content>;

  updateContent(content: Content): Promise<Content>;

  deleteContent(contentId: string): Promise<boolean>;

  findContentById(contentId: string): Promise<Nullable<Content>>;

  findContentsByGroupId(payload: {
    groupId: string;
    cursor: string; // content id
    pageSize: number;
    direction: "next" | "prev";
    sort: "recent" | "likes" | "comments" | "oldest";
  }): Promise<Content[]>;

  findContentsByOwnerAndGroupId(payload: {
    ownerId: string;
    groupId: string;
  }): Promise<Content[]>;

  findContentsByReferedAndGroupId(payload: {
    referedId: string;
    groupId: string;
  }): Promise<Content[]>;
}
