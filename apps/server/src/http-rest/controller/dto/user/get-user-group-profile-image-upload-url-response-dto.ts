import { ApiProperty } from "@nestjs/swagger";
import { IObjectStoragePort, User } from "@repo/be-core";
import { ObjectStorageKeyFactory } from "../../../../infrastructure/persistence/object-storage/key-factory/object-storage-key-factory";

export class GetUserGroupProfileImageUploadUrlResponseDTO {
  @ApiProperty({ type: "string" })
  presignedUrl!: string;

  public static async newFromUser(
    user: User,
    groupId: string,
    mediaObjectStorage: IObjectStoragePort,
  ): Promise<GetUserGroupProfileImageUploadUrlResponseDTO> {
    const dto = new GetUserGroupProfileImageUploadUrlResponseDTO();
    dto.presignedUrl = await mediaObjectStorage.getPresignedUrlForUpload(
      ObjectStorageKeyFactory.getUserGroupProfilePath(groupId, user.id),
    );
    return dto;
  }
}
