import {
  Code,
  EContentCategory,
  Exception,
  TMedia,
  TVideo,
  TImage,
  SMedia,
} from '@repo/be-core';
import { TypeormMedia } from '../../../typeorm/entity/content/typeorm-content.entity';

export class MediaMapper {
  public static toDomainEntity(payload: TypeormMedia): TMedia {
    const {
      id,
      groupId,
      ownerId,
      category,

      originalRelativePath,
      thumbnailRelativePath,
      largeRelativePath,
      createdDateTime,
      updatedDateTime,
      size,
      ext,
      mimeType,
    } = payload;

    let media: TImage | TVideo;
    if (category === EContentCategory.IMAGE) {
      media = {
        id,
        groupId,
        category: EContentCategory.IMAGE,
        ownerId,
        originalUrl: originalRelativePath,
        thumbnailUrl: thumbnailRelativePath || null,
        largeUrl: largeRelativePath || null,

        size,
        ext,
        mimeType,

        // TODO: 좋아요, 댓글 수 추가 필요
        numLikes: 0,
        numComments: 0,

        createdDateTime,
        updatedDateTime,
      } satisfies TImage;
    } else if (category === EContentCategory.VIDEO) {
      media = {
        id,
        groupId,
        category: EContentCategory.VIDEO,
        ownerId,
        originalUrl: originalRelativePath,
        thumbnailUrl: thumbnailRelativePath || null,

        size,
        ext,
        mimeType,

        // TODO: 좋아요, 댓글 수 추가 필요
        numLikes: 0,
        numComments: 0,

        createdDateTime,
        updatedDateTime,
      } satisfies TVideo;
    } else {
      console.error('invalid media content category');
      throw Exception.new({
        code: Code.INTERNAL_ERROR,
        overrideMessage: 'Invalid media content category.',
      });
    }

    return SMedia.parse(media);
  }

  public static toDomainEntityList(payload: TypeormMedia[]): TMedia[] {
    return payload.map(this.toDomainEntity);
  }
}
