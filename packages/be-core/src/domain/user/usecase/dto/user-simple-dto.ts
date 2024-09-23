import { User } from "../../entity/user";

export class UserSimpleUsecaseDto {
  readonly id: string;

  readonly username: string;

  readonly thumbnailRelativePath?: string;

  constructor(payload: UserSimpleUsecaseDto) {
    this.id = payload.id;
    this.username = payload.username;
    this.thumbnailRelativePath = payload.thumbnailRelativePath;
  }

  public static newFromUser(user: User): UserSimpleUsecaseDto {
    const dto: UserSimpleUsecaseDto = new UserSimpleUsecaseDto({
      id: user.id,
      username: user.username,
      thumbnailRelativePath: user.thumbnailRelativePath || undefined,
    });
    return dto;
  }

  public static newListFromUsers(users: User[]): UserSimpleUsecaseDto[] {
    return users.map((user) => UserSimpleUsecaseDto.newFromUser(user));
  }
}
