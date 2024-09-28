import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IObjectStoragePort, User } from "@repo/be-core";
import { ObjectStorageKeyFactory } from "../../../../infrastructure/persistence/object-storage/key-factory/object-storage-key-factory";

export class UserGroupProfileResponseDTO {
  @ApiProperty({ type: "string" })
  groupId!: string;

  @ApiProperty({ type: "string" })
  nickname!: string;

  @ApiProperty({ type: "string" })
  profileImagePath!: string;
}

export class UserResponseDTO {
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

  @ApiProperty({ type: UserGroupProfileResponseDTO, isArray: true })
  userGroupProfiles: UserGroupProfileResponseDTO[];

  @ApiProperty({ type: "number" })
  createdTimestamp: number;

  @ApiPropertyOptional({ type: "number" })
  updatedTimestamp?: number;

  constructor(payload: UserResponseDTO) {
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
  ): Promise<UserResponseDTO> {
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

    const userGroupProfiles: UserGroupProfileResponseDTO[] = [];
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

    const payload: UserResponseDTO = {
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

    return new UserResponseDTO(payload);
  }

  public static async newListFromUsers(
    users: User[],
    mediaObjectStorage: IObjectStoragePort,
  ): Promise<UserResponseDTO[]> {
    const dtos = await Promise.all(
      users.map(async (user) =>
        UserResponseDTO.newFromUser(user, mediaObjectStorage),
      ),
    );
    return dtos;
  }
}
