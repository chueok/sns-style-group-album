// 읽기 전용 클래스로, validate는 수행하지 않음.
export class GroupMember {
  readonly id: string;

  readonly username: string;

  constructor(payload: { id: string; username: string }) {
    this.id = payload.id;
    this.username = payload.username;
  }

  // for using set
  public toString(): string {
    return this.id;
  }
}
