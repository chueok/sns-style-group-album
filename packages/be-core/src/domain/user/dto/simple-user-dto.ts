export class SimpleUserDTO {
  readonly id: string;
  readonly nickname: string;
  readonly hasProfileImage: boolean;

  constructor(payload: SimpleUserDTO) {
    this.id = payload.id;
    this.nickname = payload.nickname;
    this.hasProfileImage = payload.hasProfileImage;
  }
}
