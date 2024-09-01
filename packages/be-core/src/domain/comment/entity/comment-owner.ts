import { Nullable } from "../../../common/type/common-types";

export class CommentUser {
  readonly id: string;

  readonly username: string;

  readonly thumbnailRelativePath: Nullable<string>;

  constructor(payload: {
    id: string;
    username: string;
    thumbnailRelativePath: Nullable<string>;
  }) {
    this.id = payload.id;
    this.username = payload.username;
    this.thumbnailRelativePath = payload.thumbnailRelativePath;
  }
}
