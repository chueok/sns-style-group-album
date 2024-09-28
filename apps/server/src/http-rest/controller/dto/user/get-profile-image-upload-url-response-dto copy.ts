import { ApiProperty } from "@nestjs/swagger";
import { IObjectStoragePort, User } from "@repo/be-core";
import { ObjectStorageKeyFactory } from "../../../../infrastructure/persistence/object-storage/key-factory/object-storage-key-factory";

export class GetProfileImageUploadUrlResponseDTO {
  @ApiProperty({ type: "string" })
  presignedUrl!: string;

  public static async newFromUser(
    user: User,
    mediaObjectStorage: IObjectStoragePort,
  ): Promise<GetProfileImageUploadUrlResponseDTO> {
    const dto = new GetProfileImageUploadUrlResponseDTO();
    dto.presignedUrl = await mediaObjectStorage.getPresignedUrlForUpload(
      ObjectStorageKeyFactory.getUserProfilePath(user.id),
    );
    return dto;
  }
}
