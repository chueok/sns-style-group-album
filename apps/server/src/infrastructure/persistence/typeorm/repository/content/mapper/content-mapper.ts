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
  content: TypeormContent;
  numLikes: number;
  likeList: TypeormLike[];
  numComments: number;
  commentList: TypeormComment[];
};

type ToDomainReturnType = {
  results: Content[];
  errors: Error[];
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
    payload: ToDomainPayloadType[],
  ): Promise<ToDomainReturnType> {
    const results: Content[] = [];
    const errors: Error[] = [];

    const promiseList = payload.map(async (item) => {
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

  public static toOrmEntity(payload: Content[]): ToOrmReturnType {
    const results: ToOrmReturnType["results"] = [];
    const errors: Error[] = [];

    payload.forEach((item) => {
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
    payload: ToDomainPayloadType,
  ): Promise<Content> {
    const ownerId = payload.content.ownerId;
    const referred: ReferredContent[] = (await payload.content.referred).map(
      (item) => {
        return new ReferredContent({
          id: item.id,
          type: item.contentType,
          thumbnailRelativePath: item.thumbnailRelativePath,
        });
      },
    );

    const likeList = await Promise.all(
      payload.likeList.map(async (item) => {
        return new ContentLike({
          id: item.id,
          userId: item.userId,
          createdDateTime: item.createdDateTime,
        });
      }),
    );

    const commentMapResult = await CommentMapper.toDomainEntity(
      payload.commentList.map((comment) => ({
        comment,
      })),
    );
    const commentList: Comment[] = commentMapResult.results;

    if (isTypeormSystemContent(payload.content)) {
      const contentPayload: CreateContentEntityPayload<"system", "existing"> = {
        groupId: payload.content.groupId,
        ownerId,
        referred,
        thumbnailRelativePath: payload.content.thumbnailRelativePath,

        id: payload.content.id,
        createdDateTime: payload.content.createdDateTime,
        updatedDateTime: payload.content.updatedDateTime,
        deletedDateTime: payload.content.deletedDateTime,

        numLikes: payload.numLikes,
        likeList,
        numComments: payload.numComments,
        commentList,

        text: payload.content.text,
        subText: payload.content.subText,
      };
      return SystemContent.new(contentPayload);
    } else if (isTypeormMediaContent(payload.content)) {
      const contentPayload: CreateContentEntityPayload<
        "image" | "video",
        "existing"
      > = {
        groupId: payload.content.groupId,
        ownerId,
        referred,
        thumbnailRelativePath: payload.content.thumbnailRelativePath,

        id: payload.content.id,
        createdDateTime: payload.content.createdDateTime,
        updatedDateTime: payload.content.updatedDateTime,
        deletedDateTime: payload.content.deletedDateTime,

        numLikes: payload.numLikes,
        likeList,
        numComments: payload.numComments,
        commentList,

        largeRelativePath: payload.content.largeRelativePath,
        originalRelativePath: payload.content.originalRelativePath,
        size: payload.content.size,
        ext: payload.content.ext,
        mimeType: payload.content.mimetype,
      };
      if (payload.content.contentType === ContentTypeEnum.IMAGE) {
        return ImageContent.new(contentPayload);
      } else {
        return VideoContent.new(contentPayload);
      }
    } else if (isTypeormPostContent(payload.content)) {
      const contentPayload: CreateContentEntityPayload<"post", "existing"> = {
        groupId: payload.content.groupId,
        ownerId,
        referred,
        thumbnailRelativePath: payload.content.thumbnailRelativePath,

        id: payload.content.id,
        createdDateTime: payload.content.createdDateTime,
        updatedDateTime: payload.content.updatedDateTime,
        deletedDateTime: payload.content.deletedDateTime,

        numLikes: payload.numLikes,
        likeList,
        numComments: payload.numComments,
        commentList,

        title: payload.content.title,
        text: payload.content.text,
      };
      return PostContent.new(contentPayload);
    } else if (isTypeormBucketContent(payload.content)) {
      const contentPayload: CreateContentEntityPayload<"bucket", "existing"> = {
        groupId: payload.content.groupId,
        ownerId,
        referred,
        thumbnailRelativePath: payload.content.thumbnailRelativePath,

        id: payload.content.id,
        createdDateTime: payload.content.createdDateTime,
        updatedDateTime: payload.content.updatedDateTime,
        deletedDateTime: payload.content.deletedDateTime,

        numLikes: payload.numLikes,
        likeList,
        numComments: payload.numComments,
        commentList,

        title: (payload.content as TypeormBucket).title,
        status: (payload.content as TypeormBucket).status,
      };
      return BucketContent.new(contentPayload);
    } else if (isTypeormScheduleContent(payload.content)) {
      const contentPayload: CreateContentEntityPayload<"schedule", "existing"> =
        {
          groupId: payload.content.groupId,
          ownerId,
          referred,
          thumbnailRelativePath: payload.content.thumbnailRelativePath,

          id: payload.content.id,
          createdDateTime: payload.content.createdDateTime,
          updatedDateTime: payload.content.updatedDateTime,
          deletedDateTime: payload.content.deletedDateTime,

          numLikes: payload.numLikes,
          likeList,
          numComments: payload.numComments,
          commentList,

          title: (payload.content as TypeormSchedule).title,
          startDateTime: (payload.content as TypeormSchedule).startDateTime,
          endDateTime: (payload.content as TypeormSchedule).endDateTime,
          isAllDay: (payload.content as TypeormSchedule).isAllDay,
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
