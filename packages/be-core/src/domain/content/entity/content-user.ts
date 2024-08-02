export class ContentUser {
  readonly id: string;

  readonly username: string;

  readonly thumbnailRelativePath: string;

  constructor(payload: {
    id: string;
    username: string;
    thumbnailRelativePath: string;
  }) {
    this.id = payload.id;
    this.username = payload.username;
    this.thumbnailRelativePath = payload.thumbnailRelativePath;
  }
}
