import {
  Code,
  EContentCategory,
  Exception,
  TMedia,
  TVideo,
  TImage,
  SMedia,
} from '@repo/be-core';
import { TypeormMedia } from '../../infrastructure/persistence/typeorm/entity/media/typeorm-media.entity';

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

// type ToDomainPayloadType = {
//   elements: {
//     content: TypeormContent;
//     numLikes: number;
//     likeList: TypeormLike[];
//     numComments: number;
//     referred: TypeormContent[];
//     commentElement?: CommentMapperToDomainPayloadType['elements'][0];
//   }[];
// };

// type ToDomainReturnType = {
//   results: Content[];
//   errors: Error[];
// };

// type ToOrmPayloadType = {
//   elements: Content[];
// };

// type ToOrmReturnType = {
//   results: {
//     content: TypeormContent;
//     likeList: TypeormLike[];
//   }[];
//   errors: Error[];
// };

// export class ContentMapper {
//   public static async toDomainEntity(
//     payload: ToDomainPayloadType
//   ): Promise<ToDomainReturnType> {
//     const { elements } = payload;

//     const results: Content[] = [];
//     const errors: Error[] = [];

//     const promiseList = elements.map(async (item) => {
//       return this.mapToDomainContentForUtil(item);
//     });

//     const promiseAllSettledResult = await Promise.allSettled(promiseList);

//     promiseAllSettledResult.forEach((result) => {
//       if (result.status === 'fulfilled') {
//         results.push(result.value);
//       } else {
//         errors.push(result.reason);
//       }
//     });

//     return { results, errors };
//   }

//   public static toOrmEntity(payload: ToOrmPayloadType): ToOrmReturnType {
//     const { elements } = payload;

//     const results: ToOrmReturnType['results'] = [];
//     const errors: Error[] = [];

//     elements.forEach((item) => {
//       try {
//         const content = this.mapToOrmContentForUtil(item);
//         const likeList = item.topLikeList.map((like) => {
//           const typeormLike = new TypeormLike();
//           typeormLike.id = like.id;
//           typeormLike.contentId = item.id;
//           typeormLike.userId = like.userId as UserId;
//           typeormLike.createdDateTime = like.createdDateTime;
//           return typeormLike;
//         });
//         results.push({ content, likeList });
//       } catch (error) {
//         if (error instanceof Error) {
//           errors.push(error);
//         }
//       }
//     });

//     return { results, errors };
//   }

//   private static async mapToDomainContentForUtil(
//     payload: ToDomainPayloadType['elements'][0]
//   ): Promise<Content> {
//     const {
//       content,
//       numLikes,
//       likeList,
//       numComments,
//       commentElement,
//       referred,
//     } = payload;

//     const ownerId = content.ownerId;
//     const domainReferred: ReferredContent[] = referred.map((item) => {
//       return new ReferredContent({
//         id: item.id,
//         type: item.contentType,
//         thumbnailRelativePath: item.thumbnailRelativePath,
//       });
//     });

//     const likeDomainEntityList = await Promise.all(
//       likeList.map(async (item) => {
//         return new ContentLike({
//           id: item.id,
//           userId: item.userId,
//           createdDateTime: item.createdDateTime,
//         });
//       })
//     );

//     let commentDomainEntityList: Comment[] = [];
//     if (commentElement) {
//       const commentMapResult = await CommentMapper.toDomainEntity({
//         elements: [
//           { comment: commentElement.comment, tags: commentElement.tags },
//         ],
//       });
//       commentDomainEntityList = commentMapResult.results;
//     }

//     if (content instanceof TypeormSystemContent) {
//       const contentPayload: CreateContentEntityPayload<'system', 'existing'> = {
//         groupId: content.groupId,
//         ownerId,
//         referred: domainReferred,
//         thumbnailRelativePath: content.thumbnailRelativePath,

//         id: content.id,
//         createdDateTime: content.createdDateTime,
//         updatedDateTime: content.updatedDateTime,
//         deletedDateTime: content.deletedDateTime,

//         numLikes: numLikes,
//         likeList: likeDomainEntityList,
//         numComments: numComments,
//         commentList: commentDomainEntityList,

//         text: content.text,
//         subText: content.subText,
//       };
//       return SystemContent.new(contentPayload);
//     } else if (content instanceof TypeormMedia) {
//       const contentPayload: CreateContentEntityPayload<
//         'image' | 'video',
//         'existing'
//       > = {
//         groupId: content.groupId,
//         ownerId,
//         referred: domainReferred,
//         thumbnailRelativePath: content.thumbnailRelativePath,

//         id: content.id,
//         createdDateTime: content.createdDateTime,
//         updatedDateTime: content.updatedDateTime,
//         deletedDateTime: content.deletedDateTime,

//         numLikes: numLikes,
//         likeList: likeDomainEntityList,
//         numComments: numComments,
//         commentList: commentDomainEntityList,

//         largeRelativePath: content.largeRelativePath,
//         originalRelativePath: content.originalRelativePath,
//         size: content.size,
//         ext: content.ext,
//         mimeType: content.mimetype,
//       };
//       if (content.contentType === EContentCategory.IMAGE) {
//         return ImageContent.new(contentPayload);
//       } else {
//         return VideoContent.new(contentPayload);
//       }
//     } else if (content instanceof TypeormPost) {
//       const contentPayload: CreateContentEntityPayload<'post', 'existing'> = {
//         groupId: content.groupId,
//         ownerId,
//         referred: domainReferred,
//         thumbnailRelativePath: content.thumbnailRelativePath,

//         id: content.id,
//         createdDateTime: content.createdDateTime,
//         updatedDateTime: content.updatedDateTime,
//         deletedDateTime: content.deletedDateTime,

//         numLikes: numLikes,
//         likeList: likeDomainEntityList,
//         numComments: numComments,
//         commentList: commentDomainEntityList,

//         title: content.title,
//         text: content.text,
//       };
//       return PostContent.new(contentPayload);
//     } else if (content instanceof TypeormBucket) {
//       const contentPayload: CreateContentEntityPayload<'bucket', 'existing'> = {
//         groupId: content.groupId,
//         ownerId,
//         referred: domainReferred,
//         thumbnailRelativePath: content.thumbnailRelativePath,

//         id: content.id,
//         createdDateTime: content.createdDateTime,
//         updatedDateTime: content.updatedDateTime,
//         deletedDateTime: content.deletedDateTime,

//         numLikes: numLikes,
//         likeList: likeDomainEntityList,
//         numComments: numComments,
//         commentList: commentDomainEntityList,

//         title: content.title,
//         status: content.status,
//       };
//       return BucketContent.new(contentPayload);
//     } else if (content instanceof TypeormSchedule) {
//       const contentPayload: CreateContentEntityPayload<'schedule', 'existing'> =
//         {
//           groupId: content.groupId,
//           ownerId,
//           referred: domainReferred,
//           thumbnailRelativePath: content.thumbnailRelativePath,

//           id: content.id,
//           createdDateTime: content.createdDateTime,
//           updatedDateTime: content.updatedDateTime,
//           deletedDateTime: content.deletedDateTime,

//           numLikes: numLikes,
//           likeList: likeDomainEntityList,
//           numComments: numComments,
//           commentList: commentDomainEntityList,

//           title: content.title,
//           startDateTime: content.startDateTime,
//           endDateTime: content.endDateTime,
//           isAllDay: content.isAllDay,
//         };
//       return ScheduleContent.new(contentPayload);
//     } else {
//       throw Exception.new({
//         code: Code.UTIL_PROCESS_ERROR,
//         overrideMessage: 'Invalid content type.',
//       });
//     }
//   }

//   private static mapToOrmContentForUtil(payload: Content): TypeormContent {
//     let ormContent!: TypeormContent;
//     if (payload instanceof SystemContent) {
//       const systemContent = new TypeormSystemContent();
//       systemContent.text = payload.text;
//       systemContent.subText = payload.subText;
//       ormContent = systemContent;
//     } else if (payload instanceof BucketContent) {
//       const bucketContent = new TypeormBucket();
//       bucketContent.title = payload.title;
//       bucketContent.status = payload.status;
//       ormContent = bucketContent;
//     } else if (payload instanceof ImageContent) {
//       const mediaContent = new TypeormMedia();
//       mediaContent.largeRelativePath = payload.largeRelativePath;
//       mediaContent.originalRelativePath = payload.originalRelativePath;
//       mediaContent.size = payload.size;
//       mediaContent.ext = payload.ext;
//       mediaContent.mimetype = payload.mimetype;
//       ormContent = mediaContent;
//     } else if (payload instanceof VideoContent) {
//       const mediaContent = new TypeormMedia();
//       mediaContent.largeRelativePath = null;
//       mediaContent.originalRelativePath = payload.originalRelativePath;
//       mediaContent.size = payload.size;
//       mediaContent.ext = payload.ext;
//       mediaContent.mimetype = payload.mimetype;
//       ormContent = mediaContent;
//     } else if (payload instanceof PostContent) {
//       const postContent = new TypeormPost();
//       postContent.title = payload.title;
//       postContent.text = payload.text;
//       ormContent = postContent;
//     } else if (payload instanceof ScheduleContent) {
//       const scheduleContent = new TypeormSchedule();
//       scheduleContent.title = payload.title;
//       scheduleContent.endDateTime = payload.endDateTime;
//       ormContent = scheduleContent;
//     } else {
//       throw Exception.new({
//         code: Code.UTIL_PROCESS_ERROR,
//         overrideMessage: 'Invalid content type.',
//       });
//     }
//     ormContent.id = payload.id;
//     ormContent.groupId = payload.groupId;
//     ormContent.ownerId = payload.ownerId;
//     ormContent.thumbnailRelativePath = payload.thumbnailRelativePath;
//     ormContent.contentType = payload.type;
//     ormContent.createdDateTime = payload.createdDateTime;
//     ormContent.updatedDateTime = payload.updatedDateTime;
//     ormContent.deletedDateTime = payload.deletedDateTime;
//     return ormContent;
//   }
// }
