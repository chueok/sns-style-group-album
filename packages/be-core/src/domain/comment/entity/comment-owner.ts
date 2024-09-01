import { Nullable } from "../../../common/type/common-types";

// TODO CommentUser 로 이름 변경 필요
export class CommentOwner {
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
