import { Nullable } from "../../../common/type/common-types";

export class ContentLike {
  readonly id: string;

  readonly userId: string;

  readonly userThumbnailRelativePath: Nullable<string>;

  readonly createdDateTime: Date;

  constructor(payload: {
    id: string;
    userId: string;
    userThumbnailRelativePath: Nullable<string>;
    createdDateTime: Date;
  }) {
    this.id = payload.id;
    this.userId = payload.userId;
    this.userThumbnailRelativePath = payload.userThumbnailRelativePath;
    this.createdDateTime = payload.createdDateTime;
  }
}
