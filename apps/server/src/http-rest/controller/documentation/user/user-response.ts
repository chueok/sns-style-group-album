import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IObjectStoragePort, User } from "@repo/be-core";
import { ObjectStorageKeyFactory } from "../../../../infrastructure/persistence/object-storage/key-factory/object-storage-key-factory";

export class UserGroupProfileResponseDto {
  @ApiProperty({ type: "string" })
  groupId!: string;

  @ApiProperty({ type: "string" })
  nickname!: string;

  @ApiProperty({ type: "string" })
  profileImagePath!: string;
}

export class UserResponseDto {
  @ApiProperty({ type: "string" })
  id: string;

  @ApiProperty({ type: "string" })
  username: string;

  @ApiPropertyOptional({ type: "string" })
  email?: string;

  @ApiPropertyOptional({ type: "string" })
  profileImagePath?: string;

  @ApiProperty({ type: "string", isArray: true })
  groups: string[];

  @ApiProperty({ type: "string", isArray: true })
  ownGroups: string[];

  @ApiProperty({ type: UserGroupProfileResponseDto, isArray: true })
  userGroupProfiles: UserGroupProfileResponseDto[];

  @ApiProperty({ type: "number" })
  createdTimestamp: number;

  @ApiPropertyOptional({ type: "number" })
  updatedTimestamp?: number;

  constructor(payload: UserResponseDto) {
    this.id = payload.id;
    this.username = payload.username;
    this.email = payload.email;
    this.profileImagePath = payload.profileImagePath;
    this.groups = payload.groups;
    this.ownGroups = payload.ownGroups;
    this.userGroupProfiles = payload.userGroupProfiles;
    this.createdTimestamp = payload.createdTimestamp;
    this.updatedTimestamp = payload.updatedTimestamp;
  }

  public static async newFromUser(
    user: User,
    mediaObjectStorage: IObjectStoragePort,
  ): Promise<UserResponseDto> {
    let profileImagePath: string | undefined = undefined;
    if (user.hasProfile) {
      profileImagePath = await mediaObjectStorage.getPresignedUrlForDownload(
        ObjectStorageKeyFactory.getUserProfilePath(user.id),
      );
    }

    const userGroupProfilesPromises = user.userGroupProfiles.map(
      async (profile) => {
        const profileImagePath =
          await mediaObjectStorage.getPresignedUrlForDownload(
            ObjectStorageKeyFactory.getUserGroupProfilePath(
              profile.groupId,
              user.id,
            ),
          );

        return {
          groupId: profile.groupId,
          nickname: profile.nickname,
          profileImagePath,
        };
      },
    );

    const userGroupProfiles: UserGroupProfileResponseDto[] = [];
    const error: Error[] = []; // TODO : error logging 필요
    await Promise.allSettled(userGroupProfilesPromises).then((results) => {
      results.forEach((result) => {
        if (result.status === "fulfilled") {
          userGroupProfiles.push(result.value);
        } else {
          error.push(result.reason);
        }
      });
    });

    const payload: UserResponseDto = {
      id: user.id,
      username: user.username,
      email: user.email || undefined,
      profileImagePath,
      groups: user.groups,
      ownGroups: user.ownGroups,
      userGroupProfiles,
      createdTimestamp: user.createdDateTime.getTime(),
      updatedTimestamp: user.updatedDateTime?.getTime(),
    };

    return new UserResponseDto(payload);
  }

  public static async newListFromUsers(
    users: User[],
    mediaObjectStorage: IObjectStoragePort,
  ): Promise<UserResponseDto[]> {
    const dtos = await Promise.all(
      users.map(async (user) =>
        UserResponseDto.newFromUser(user, mediaObjectStorage),
      ),
    );
    return dtos;
  }
}
