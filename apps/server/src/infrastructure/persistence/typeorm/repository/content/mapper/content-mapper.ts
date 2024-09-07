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
  isTypeormBucketContent,
  isTypeormMediaContent,
  isTypeormPostContent,
  isTypeormScheduleContent,
  isTypeormSystemContent,
  TypeormBucket,
  TypeormContent,
  TypeormMedia,
  TypeormPost,
  TypeormSchedule,
  TypeormSystemContent,
} from "../../../entity/content/typeorm-content.entity";
import { TypeormLike } from "../../../entity/like/typeorm-like.entity";
import { TypeormComment } from "../../../entity/comment/typeorm-comment.entity";
import { CommentMapper } from "../../comment/mapper/comment-mapper";

type ToDomainPayloadType = {
  elements: {
    content: TypeormContent;
    numLikes: number;
    likeList: TypeormLike[];
    numComments: number;
    commentList: TypeormComment[];
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
      return this.toDomainContent(item);
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
        const content = this.toOrmContent(item);
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

  private static async toDomainContent(
    payload: ToDomainPayloadType["elements"][0],
  ): Promise<Content> {
    const { content, numLikes, likeList, numComments, commentList } = payload;

    const ownerId = content.ownerId;
    const referred: ReferredContent[] = (await payload.content.referred).map(
      (item) => {
        return new ReferredContent({
          id: item.id,
          type: item.contentType,
          thumbnailRelativePath: item.thumbnailRelativePath,
        });
      },
    );

    const likeDomainEntityList = await Promise.all(
      likeList.map(async (item) => {
        return new ContentLike({
          id: item.id,
          userId: item.userId,
          createdDateTime: item.createdDateTime,
        });
      }),
    );

    const commentMapResult = await CommentMapper.toDomainEntity({
      elements: commentList,
    });
    const commentDomainEntityList: Comment[] = commentMapResult.results;

    if (isTypeormSystemContent(content)) {
      const contentPayload: CreateContentEntityPayload<"system", "existing"> = {
        groupId: content.groupId,
        ownerId,
        referred,
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
    } else if (isTypeormMediaContent(content)) {
      const contentPayload: CreateContentEntityPayload<
        "image" | "video",
        "existing"
      > = {
        groupId: content.groupId,
        ownerId,
        referred,
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
    } else if (isTypeormPostContent(content)) {
      const contentPayload: CreateContentEntityPayload<"post", "existing"> = {
        groupId: content.groupId,
        ownerId,
        referred,
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
    } else if (isTypeormBucketContent(content)) {
      const contentPayload: CreateContentEntityPayload<"bucket", "existing"> = {
        groupId: content.groupId,
        ownerId,
        referred,
        thumbnailRelativePath: content.thumbnailRelativePath,

        id: content.id,
        createdDateTime: content.createdDateTime,
        updatedDateTime: content.updatedDateTime,
        deletedDateTime: content.deletedDateTime,

        numLikes: numLikes,
        likeList: likeDomainEntityList,
        numComments: numComments,
        commentList: commentDomainEntityList,

        title: (content as TypeormBucket).title,
        status: (content as TypeormBucket).status,
      };
      return BucketContent.new(contentPayload);
    } else if (isTypeormScheduleContent(content)) {
      const contentPayload: CreateContentEntityPayload<"schedule", "existing"> =
        {
          groupId: content.groupId,
          ownerId,
          referred,
          thumbnailRelativePath: content.thumbnailRelativePath,

          id: content.id,
          createdDateTime: content.createdDateTime,
          updatedDateTime: content.updatedDateTime,
          deletedDateTime: content.deletedDateTime,

          numLikes: numLikes,
          likeList: likeDomainEntityList,
          numComments: numComments,
          commentList: commentDomainEntityList,

          title: (content as TypeormSchedule).title,
          startDateTime: (content as TypeormSchedule).startDateTime,
          endDateTime: (content as TypeormSchedule).endDateTime,
          isAllDay: (content as TypeormSchedule).isAllDay,
        };
      return ScheduleContent.new(contentPayload);
    } else {
      throw Exception.new({
        code: Code.UTIL_PROCESS_ERROR,
        overrideMessage: "Invalid content type.",
      });
    }
  }

  private static toOrmContent(payload: Content): TypeormContent {
    let ormContent!: TypeormContent;
    if (payload.type === ContentTypeEnum.SYSTEM) {
      ormContent = new TypeormSystemContent();
      (ormContent as TypeormSystemContent).text = (
        payload as SystemContent
      ).text;
      (ormContent as TypeormSystemContent).subText = (
        payload as SystemContent
      ).subText;
    } else if (payload.type === ContentTypeEnum.BUCKET) {
      ormContent = new TypeormBucket();
      (ormContent as TypeormBucket).title = (payload as BucketContent).title;
      (ormContent as TypeormBucket).status = (payload as BucketContent).status;
    } else if (
      payload.type === ContentTypeEnum.IMAGE ||
      payload.type === ContentTypeEnum.VIDEO
    ) {
      ormContent = new TypeormMedia();
      (ormContent as TypeormMedia).largeRelativePath = (
        payload as ImageContent
      ).largeRelativePath;
      (ormContent as TypeormMedia).originalRelativePath = (
        payload as ImageContent
      ).originalRelativePath;
      (ormContent as TypeormMedia).size = (payload as ImageContent).size;
      (ormContent as TypeormMedia).ext = (payload as ImageContent).ext;
      (ormContent as TypeormMedia).mimetype = (
        payload as ImageContent
      ).mimetype;
    } else if (payload.type === ContentTypeEnum.POST) {
      ormContent = new TypeormPost();
      (ormContent as TypeormPost).title = (payload as PostContent).title;
      (ormContent as TypeormPost).text = (payload as PostContent).text;
    } else if (payload.type === ContentTypeEnum.SCHEDULE) {
      ormContent = new TypeormSchedule();
      (ormContent as TypeormSchedule).title = (
        payload as ScheduleContent
      ).title;
      (ormContent as TypeormSchedule).endDateTime = (
        payload as ScheduleContent
      ).endDateTime;
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
