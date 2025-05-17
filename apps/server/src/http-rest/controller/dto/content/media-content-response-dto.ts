import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  ContentTypeEnum,
  IObjectStoragePort,
  MediaContent,
} from '@repo/be-core';
import { CommentResponseDTO } from '../comment/comment-response-dto';

export class MediaContentResponseDTO {
  @ApiProperty({ type: 'string' })
  id!: string;

  @ApiProperty({ enum: [ContentTypeEnum.IMAGE, ContentTypeEnum.VIDEO] })
  type!: ContentTypeEnum.IMAGE | ContentTypeEnum.VIDEO;

  @ApiProperty({ type: 'string' })
  ownerId!: string;

  @ApiPropertyOptional({ type: 'string' })
  thumbnailPath?: string;

  @ApiPropertyOptional({ type: 'string' })
  largePath?: string;

  @ApiPropertyOptional({ type: 'string' })
  originalPath?: string;

  @ApiProperty({ type: 'number' })
  numLikes!: number;

  @ApiProperty({ type: 'string', isArray: true })
  topLikeUserIds!: string[];

  @ApiProperty({ type: 'number' })
  numComments!: number;

  @ApiProperty({ type: CommentResponseDTO, isArray: true })
  topComments!: CommentResponseDTO[];

  @ApiProperty({ type: 'number' })
  createdTimestamp!: number;

  @ApiProperty({ type: 'number' })
  updatedTimestamp?: number;

  public static async newFromContent(
    content: MediaContent,
    mediaObjectStorage: IObjectStoragePort
  ): Promise<MediaContentResponseDTO> {
    const dto = new MediaContentResponseDTO();

    const [thumbnailPath, largePath, originalPath] = await Promise.all(
      [
        content.thumbnailRelativePath,
        content.largeRelativePath,
        content.originalRelativePath,
      ].map(async (path) => {
        if (path) {
          const presignedUrl =
            await mediaObjectStorage.getPresignedUrlForDownload(path);
          return presignedUrl;
        }
        return undefined;
      })
    );

    dto.id = content.id;
    dto.type = content.type;
    dto.ownerId = content.ownerId;
    dto.thumbnailPath = thumbnailPath;
    dto.largePath = largePath;
    dto.originalPath = originalPath;
    dto.numLikes = content.numLikes;
    dto.topLikeUserIds = content.topLikeList.map((like) => like.userId);
    dto.numComments = content.numComments;
    dto.topComments;
    dto.createdTimestamp = content.createdDateTime.getTime();
    dto.updatedTimestamp = content.updatedDateTime?.getTime();

    return dto;
  }

  public static async newListFromContents(
    contents: MediaContent[],
    mediaObjectStorage: IObjectStoragePort
  ) {
    return Promise.all(
      contents.map((content) =>
        MediaContentResponseDTO.newFromContent(content, mediaObjectStorage)
      )
    );
  }
}
