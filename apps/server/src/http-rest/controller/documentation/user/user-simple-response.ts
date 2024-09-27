import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IObjectStoragePort, User } from "@repo/be-core";
import { ObjectStorageKeyFactory } from "../../../../infrastructure/persistence/object-storage/key-factory/object-storage-key-factory";

export class UserSimpleResponse {
  @ApiProperty({ type: "string" })
  id: string;

  @ApiProperty({ type: "string" })
  username: string;

  @ApiPropertyOptional({ type: "string" })
  profileImagePath?: string;

  constructor(payload: UserSimpleResponse) {
    this.id = payload.id;
    this.username = payload.username;
    this.profileImagePath = payload.profileImagePath;
  }

  public static async newFromUser(payload: {
    user: User;
    groupId: string;
    mediaObjectStorage: IObjectStoragePort;
  }): Promise<UserSimpleResponse> {
    const { user, groupId, mediaObjectStorage } = payload;
    let profileImagePath: string | undefined = undefined;
    const userGroupProfile = user.userGroupProfiles.find(
      (profile) => profile.groupId === groupId,
    );
    if (userGroupProfile && userGroupProfile.hasProfileImage) {
      profileImagePath = await mediaObjectStorage.getPresignedUrlForDownload(
        ObjectStorageKeyFactory.getUserGroupProfilePath(groupId, user.id),
      );
    }
    const dto: UserSimpleResponse = new UserSimpleResponse({
      id: user.id,
      username: user.username,
      profileImagePath,
    });
    return dto;
  }
}
