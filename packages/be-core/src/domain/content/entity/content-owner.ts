export class ContentOwner {
  readonly id: string;

  readonly username: string;

  constructor(payload: { id: string; username: string }) {
    this.id = payload.id;
    this.username = payload.username;
  }
}
