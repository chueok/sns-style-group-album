import { ApiProperty } from "@nestjs/swagger";
import { IObjectStoragePort } from "@repo/be-core";
import { ObjectStorageKeyFactory } from "../../../../infrastructure/persistence/object-storage/key-factory/object-storage-key-factory";

export class GetUserGroupProfileImageUploadUrlResponseDTO {
  @ApiProperty({ type: "string" })
  presignedUrl!: string;

  public static async new(
    userId: string,
    groupId: string,
    mediaObjectStorage: IObjectStoragePort,
  ): Promise<GetUserGroupProfileImageUploadUrlResponseDTO> {
    const dto = new GetUserGroupProfileImageUploadUrlResponseDTO();
    dto.presignedUrl = await mediaObjectStorage.getPresignedUrlForUpload(
      ObjectStorageKeyFactory.getUserGroupProfilePath(groupId, userId),
    );
    return dto;
  }
}
