export class ContentLike {
  readonly id: string;

  readonly userId: string;

  readonly createdDateTime: Date;

  constructor(payload: { id: string; userId: string; createdDateTime: Date }) {
    this.id = payload.id;
    this.userId = payload.userId;
    this.createdDateTime = payload.createdDateTime;
  }
}
