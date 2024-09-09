import {
  BucketContent,
  Code,
  Comment,
  Content,
  ContentLike,
  ContentTypeEnum,
  CreateContentEntityPayload,
  Exception,
  ImageContent,
  PostContent,
  ReferredContent,
  ScheduleContent,
  SystemContent,
  UserId,
  VideoContent,
} from "@repo/be-core";
import {
  TypeormBucket,
  TypeormContent,
  TypeormMedia,
  TypeormPost,
  TypeormSchedule,
  TypeormSystemContent,
} from "../../../entity/content/typeorm-content.entity";
import { TypeormLike } from "../../../entity/like/typeorm-like.entity";
import {
  CommentMapper,
  CommentMapperToDomainPayloadType,
} from "../../comment/mapper/comment-mapper";

type ToDomainPayloadType = {
  elements: {
    content: TypeormContent;
    numLikes: number;
    likeList: TypeormLike[];
    numComments: number;
    referred: TypeormContent[];
    commentElement?: CommentMapperToDomainPayloadType["elements"][0];
  }[];
};

type ToDomainReturnType = {
  results: Content[];
  errors: Error[];
};

type ToOrmPayloadType = {
  elements: Content[];
};

type ToOrmReturnType = {
  results: {
    content: TypeormContent;
    likeList: TypeormLike[];
  }[];
  errors: Error[];
};

export class ContentMapper {
  public static async toDomainEntity(
    payload: ToDomainPayloadType,
  ): Promise<ToDomainReturnType> {
    const { elements } = payload;

    const results: Content[] = [];
    const errors: Error[] = [];

    const promiseList = elements.map(async (item) => {
      return this.mapToDomainContentForUtil(item);
    });

    const promiseAllSettledResult = await Promise.allSettled(promiseList);

    promiseAllSettledResult.forEach((result) => {
      if (result.status === "fulfilled") {
        results.push(result.value);
      } else {
        errors.push(result.reason);
      }
    });

    return { results, errors };
  }

  public static toOrmEntity(payload: ToOrmPayloadType): ToOrmReturnType {
    const { elements } = payload;

    const results: ToOrmReturnType["results"] = [];
    const errors: Error[] = [];

    elements.forEach((item) => {
      try {
        const content = this.mapToOrmContentForUtil(item);
        const likeList = item.likeList.map((like) => {
          const typeormLike = new TypeormLike();
          typeormLike.id = like.id;
          typeormLike.contentId = item.id;
          typeormLike.userId = like.userId as UserId;
          typeormLike.createdDateTime = like.createdDateTime;
          return typeormLike;
        });
        results.push({ content, likeList });
      } catch (error) {
        if (error instanceof Error) {
          errors.push(error);
        }
      }
    });

    return { results, errors };
  }

  private static async mapToDomainContentForUtil(
    payload: ToDomainPayloadType["elements"][0],
  ): Promise<Content> {
    const {
      content,
      numLikes,
      likeList,
      numComments,
      commentElement,
      referred,
    } = payload;

    const ownerId = content.ownerId;
    const domainReferred: ReferredContent[] = referred.map((item) => {
      return new ReferredContent({
        id: item.id,
        type: item.contentType,
        thumbnailRelativePath: item.thumbnailRelativePath,
      });
    });

    const likeDomainEntityList = await Promise.all(
      likeList.map(async (item) => {
        return new ContentLike({
          id: item.id,
          userId: item.userId,
          createdDateTime: item.createdDateTime,
        });
      }),
    );

    let commentDomainEntityList: Comment[] = [];
    if (commentElement) {
      const commentMapResult = await CommentMapper.toDomainEntity({
        elements: [
          { comment: commentElement.comment, tags: commentElement.tags },
        ],
      });
      commentDomainEntityList = commentMapResult.results;
    }

    if (content instanceof TypeormSystemContent) {
      const contentPayload: CreateContentEntityPayload<"system", "existing"> = {
        groupId: content.groupId,
        ownerId,
        referred: domainReferred,
        thumbnailRelativePath: content.thumbnailRelativePath,

        id: content.id,
        createdDateTime: content.createdDateTime,
        updatedDateTime: content.updatedDateTime,
        deletedDateTime: content.deletedDateTime,

        numLikes: numLikes,
        likeList: likeDomainEntityList,
        numComments: numComments,
        commentList: commentDomainEntityList,

        text: content.text,
        subText: content.subText,
      };
      return SystemContent.new(contentPayload);
    } else if (content instanceof TypeormMedia) {
      const contentPayload: CreateContentEntityPayload<
        "image" | "video",
        "existing"
      > = {
        groupId: content.groupId,
        ownerId,
        referred: domainReferred,
        thumbnailRelativePath: content.thumbnailRelativePath,

        id: content.id,
        createdDateTime: content.createdDateTime,
        updatedDateTime: content.updatedDateTime,
        deletedDateTime: content.deletedDateTime,

        numLikes: numLikes,
        likeList: likeDomainEntityList,
        numComments: numComments,
        commentList: commentDomainEntityList,

        largeRelativePath: content.largeRelativePath,
        originalRelativePath: content.originalRelativePath,
        size: content.size,
        ext: content.ext,
        mimeType: content.mimetype,
      };
      if (content.contentType === ContentTypeEnum.IMAGE) {
        return ImageContent.new(contentPayload);
      } else {
        return VideoContent.new(contentPayload);
      }
    } else if (content instanceof TypeormPost) {
      const contentPayload: CreateContentEntityPayload<"post", "existing"> = {
        groupId: content.groupId,
        ownerId,
        referred: domainReferred,
        thumbnailRelativePath: content.thumbnailRelativePath,

        id: content.id,
        createdDateTime: content.createdDateTime,
        updatedDateTime: content.updatedDateTime,
        deletedDateTime: content.deletedDateTime,

        numLikes: numLikes,
        likeList: likeDomainEntityList,
        numComments: numComments,
        commentList: commentDomainEntityList,

        title: content.title,
        text: content.text,
      };
      return PostContent.new(contentPayload);
    } else if (content instanceof TypeormBucket) {
      const contentPayload: CreateContentEntityPayload<"bucket", "existing"> = {
        groupId: content.groupId,
        ownerId,
        referred: domainReferred,
        thumbnailRelativePath: content.thumbnailRelativePath,

        id: content.id,
        createdDateTime: content.createdDateTime,
        updatedDateTime: content.updatedDateTime,
        deletedDateTime: content.deletedDateTime,

        numLikes: numLikes,
        likeList: likeDomainEntityList,
        numComments: numComments,
        commentList: commentDomainEntityList,

        title: content.title,
        status: content.status,
      };
      return BucketContent.new(contentPayload);
    } else if (content instanceof TypeormSchedule) {
      const contentPayload: CreateContentEntityPayload<"schedule", "existing"> =
        {
          groupId: content.groupId,
          ownerId,
          referred: domainReferred,
          thumbnailRelativePath: content.thumbnailRelativePath,

          id: content.id,
          createdDateTime: content.createdDateTime,
          updatedDateTime: content.updatedDateTime,
          deletedDateTime: content.deletedDateTime,

          numLikes: numLikes,
          likeList: likeDomainEntityList,
          numComments: numComments,
          commentList: commentDomainEntityList,

          title: content.title,
          startDateTime: content.startDateTime,
          endDateTime: content.endDateTime,
          isAllDay: content.isAllDay,
        };
      return ScheduleContent.new(contentPayload);
    } else {
      throw Exception.new({
        code: Code.UTIL_PROCESS_ERROR,
        overrideMessage: "Invalid content type.",
      });
    }
  }

  private static mapToOrmContentForUtil(payload: Content): TypeormContent {
    let ormContent!: TypeormContent;
    if (payload instanceof SystemContent) {
      ormContent = new TypeormSystemContent();
      (ormContent as TypeormSystemContent).text = payload.text;
      (ormContent as TypeormSystemContent).subText = payload.subText;
    } else if (payload instanceof BucketContent) {
      ormContent = new TypeormBucket();
      (ormContent as TypeormBucket).title = (payload as BucketContent).title;
      (ormContent as TypeormBucket).status = (payload as BucketContent).status;
    } else if (payload instanceof ImageContent) {
      ormContent = new TypeormMedia();
      (ormContent as TypeormMedia).largeRelativePath =
        payload.largeRelativePath;
      (ormContent as TypeormMedia).originalRelativePath =
        payload.originalRelativePath;
      (ormContent as TypeormMedia).size = payload.size;
      (ormContent as TypeormMedia).ext = payload.ext;
      (ormContent as TypeormMedia).mimetype = payload.mimetype;
    } else if (payload instanceof VideoContent) {
      ormContent = new TypeormMedia();
      (ormContent as TypeormMedia).largeRelativePath = null;
      (ormContent as TypeormMedia).originalRelativePath =
        payload.originalRelativePath;
      (ormContent as TypeormMedia).size = payload.size;
      (ormContent as TypeormMedia).ext = payload.ext;
      (ormContent as TypeormMedia).mimetype = payload.mimetype;
    } else if (payload instanceof PostContent) {
      ormContent = new TypeormPost();
      (ormContent as TypeormPost).title = payload.title;
      (ormContent as TypeormPost).text = payload.text;
    } else if (payload instanceof ScheduleContent) {
      ormContent = new TypeormSchedule();
      (ormContent as TypeormSchedule).title = payload.title;
      (ormContent as TypeormSchedule).endDateTime = payload.endDateTime;
    } else {
      throw Exception.new({
        code: Code.UTIL_PROCESS_ERROR,
        overrideMessage: "Invalid content type.",
      });
    }
    ormContent.id = payload.id;
    ormContent.groupId = payload.groupId;
    ormContent.ownerId = payload.ownerId;
    ormContent.thumbnailRelativePath = payload.thumbnailRelativePath;
    ormContent.contentType = payload.type;
    ormContent.createdDateTime = payload.createdDateTime;
    ormContent.updatedDateTime = payload.updatedDateTime;
    ormContent.deletedDateTime = payload.deletedDateTime;
    return ormContent;
  }
}
