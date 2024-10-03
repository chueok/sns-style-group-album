import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Content, ContentTypeEnum, IObjectStoragePort } from "@repo/be-core";

export class ContentSimpleResponseDTO {
  @ApiProperty({ type: "string" })
  id!: string;

  @ApiProperty({ type: "string" })
  groupId!: string;

  @ApiProperty({ enum: ContentTypeEnum })
  type!: ContentTypeEnum;

  @ApiProperty({ type: "string" })
  ownerId!: string;

  @ApiPropertyOptional({ type: "string" })
  thumbnailRelativePath?: string;

  @ApiProperty({ type: "number" })
  numLikes!: number;

  @ApiProperty({ type: "number" })
  numComments!: number;

  @ApiProperty({ type: "number" })
  createdTimestamp!: number;

  public static async newFromContent(
    content: Content,
    mediaObjectStorage: IObjectStoragePort,
  ): Promise<ContentSimpleResponseDTO> {
    const dto = new ContentSimpleResponseDTO();
    dto.id = content.id;
    dto.groupId = content.groupId;
    dto.type = content.type;
    dto.ownerId = content.ownerId;
    dto.thumbnailRelativePath = content.thumbnailRelativePath
      ? await mediaObjectStorage.getPresignedUrlForDownload(
          content.thumbnailRelativePath,
        )
      : undefined;
    dto.numLikes = content.numLikes;
    dto.numComments = content.numComments;
    dto.createdTimestamp = content.createdDateTime.getTime();
    return dto;
  }

  public static async newListFromContents(
    contents: Content[],
    mediaObjectStorage: IObjectStoragePort,
  ) {
    return Promise.all(
      contents.map((content) =>
        ContentSimpleResponseDTO.newFromContent(content, mediaObjectStorage),
      ),
    );
  }
}
