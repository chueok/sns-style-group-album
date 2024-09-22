import { User } from "../../entity/user";

export class UserDto {
  readonly id: string;

  readonly username: string;

  readonly email?: string;

  readonly thumbnailRelativePath?: string;

  readonly groups: string[];

  readonly ownGroups: string[];

  readonly createdTimestamp: number;

  readonly updatedTimestamp?: number;

  constructor(payload: UserDto) {
    this.id = payload.id;
    this.username = payload.username;
    this.email = payload.email;
    this.thumbnailRelativePath = payload.thumbnailRelativePath;
    this.groups = payload.groups;
    this.ownGroups = payload.ownGroups;
    this.createdTimestamp = payload.createdTimestamp;
    this.updatedTimestamp = payload.updatedTimestamp;
  }

  public static newFromUser(user: User): UserDto {
    const dto: UserDto = new UserDto({
      id: user.id,
      username: user.username,
      email: user.email || undefined,
      thumbnailRelativePath: user.thumbnailRelativePath || undefined,
      groups: user.groups,
      ownGroups: user.ownGroups,
      createdTimestamp: user.createdDateTime.getTime(),
      updatedTimestamp: user.updatedDateTime?.getTime(),
    });
    return dto;
  }

  public static newListFromUsers(users: User[]): UserDto[] {
    return users.map((user) => UserDto.newFromUser(user));
  }
}
