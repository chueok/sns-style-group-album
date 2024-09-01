import {
  BucketContent,
  Comment,
  Content,
  ContentLike,
  ContentTypeEnum,
  ContentUser,
  CreateContentEntityPayload,
  ImageContent,
  Nullable,
  PostContent,
  ReferredContent,
  ScheduleContent,
  SystemContent,
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
import { TypeormComment } from "../../../entity/comment/typeorm-comment.entity";
import { CommentMapper } from "../../comment/mapper/comment-mapper";

type OrmToDomainPayloadType<T extends TypeormContent = TypeormContent> = {
  content: T;
  numLikes: number;
  likeList: TypeormLike[];
  numComments: number;
  commentList: TypeormComment[];
};

type DomainToOrmReturnType = {
  content: TypeormContent;
  likeList: TypeormLike[];
};

export class ContentMapper {
  private static async toDomainContent(
    payload: OrmToDomainPayloadType,
  ): Promise<Content | null> {
    const ormOwner = await payload.content.owner;
    const owner: ContentUser = new ContentUser({
      id: ormOwner.id,
      username: ormOwner.username,
      thumbnailRelativePath: ormOwner.thumbnailRelativePath,
    });
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
          userThumbnailRelativePath: (await item.user).thumbnailRelativePath,
          createdDateTime: item.createdDateTime,
        });
      }),
    );

    const commentList: Comment[] = await CommentMapper.toDomainEntity(
      payload.commentList.map((comment) => ({
        comment,
        content: payload.content,
      })),
    );

    if (payload.content.contentType === ContentTypeEnum.SYSTEM) {
      const contentPayload: CreateContentEntityPayload<"system", "existing"> = {
        groupId: payload.content.groupId,
        owner,
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

        text: (payload.content as TypeormSystemContent).text,
        subText: (payload.content as TypeormSystemContent).subText,
      };
      return SystemContent.new(contentPayload);
    } else if (payload.content.contentType === ContentTypeEnum.IMAGE) {
      const contentPayload: CreateContentEntityPayload<"image", "existing"> = {
        groupId: payload.content.groupId,
        owner,
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

        largeRelativePath: (payload.content as TypeormMedia).largeRelativePath,
        originalRelativePath: (payload.content as TypeormMedia)
          .originalRelativePath,
        size: (payload.content as TypeormMedia).size,
        ext: (payload.content as TypeormMedia).ext,
        mimeType: (payload.content as TypeormMedia).mimetype,
      };
      return ImageContent.new(contentPayload);
    } else if (payload.content.contentType === ContentTypeEnum.VIDEO) {
      const contentPayload: CreateContentEntityPayload<"video", "existing"> = {
        groupId: payload.content.groupId,
        owner,
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

        originalRelativePath: (payload.content as TypeormMedia)
          .originalRelativePath,
        size: (payload.content as TypeormMedia).size,
        ext: (payload.content as TypeormMedia).ext,
        mimeType: (payload.content as TypeormMedia).mimetype,
      };
      return VideoContent.new(contentPayload);
    } else if (payload.content.contentType === ContentTypeEnum.POST) {
      const contentPayload: CreateContentEntityPayload<"post", "existing"> = {
        groupId: payload.content.groupId,
        owner,
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

        title: (payload.content as TypeormPost).title,
        text: (payload.content as TypeormPost).text,
      };
      return PostContent.new(contentPayload);
    } else if (payload.content.contentType === ContentTypeEnum.BUCKET) {
      const contentPayload: CreateContentEntityPayload<"bucket", "existing"> = {
        groupId: payload.content.groupId,
        owner,
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
    } else if (payload.content.contentType === ContentTypeEnum.SCHEDULE) {
      const contentPayload: CreateContentEntityPayload<"schedule", "existing"> =
        {
          groupId: payload.content.groupId,
          owner,
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
      // TODO : error logging
      return null;
    }
  }

  public static toDomainEntity(
    payload: OrmToDomainPayloadType,
  ): Promise<Nullable<Content>>;
  public static toDomainEntity(
    payload: OrmToDomainPayloadType[],
  ): Promise<Content[]>;
  public static async toDomainEntity(
    payload: OrmToDomainPayloadType | OrmToDomainPayloadType[],
  ): Promise<Nullable<Content> | Content[]> {
    const payloadList = Array.isArray(payload) ? payload : [payload];

    const promises = payloadList.map(async (item) => {
      return this.toDomainContent(item);
    });

    let domainEntities!: Content[];
    try {
      domainEntities = (await Promise.all(promises)).filter(
        (item) => item !== null,
      );
    } catch (error) {
      console.log((error as any).data, (error as any).data.errors);
    }
    if (Array.isArray(payload)) {
      return domainEntities;
    } else {
      return domainEntities[0] || null;
    }
  }

  private static toOrmContent(payload: Content): Nullable<TypeormContent> {
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
      return null;
    }
    ormContent.id = payload.id;
    ormContent.groupId = payload.groupId;
    ormContent.ownerId = payload.owner.id;
    ormContent.thumbnailRelativePath = payload.thumbnailRelativePath;
    ormContent.contentType = payload.type;
    ormContent.createdDateTime = payload.createdDateTime;
    ormContent.updatedDateTime = payload.updatedDateTime;
    ormContent.deletedDateTime = payload.deletedDateTime;
    return ormContent;
  }

  public static toOrmEntity(payload: Content): DomainToOrmReturnType;
  public static toOrmEntity(payload: Content[]): DomainToOrmReturnType[];
  public static toOrmEntity(
    payload: Content | Content[],
  ): DomainToOrmReturnType | DomainToOrmReturnType[] {
    const payloadList = Array.isArray(payload) ? payload : [payload];

    const resultList = payloadList.map((item) => {
      const content = this.toOrmContent(item);
      if (!content) return null;
      const likeList = item.likeList.map((like) => {
        const typeormLike = new TypeormLike();
        typeormLike.id = like.id;
        typeormLike.contentId = item.id;
        typeormLike.userId = like.userId;
        typeormLike.createdDateTime = like.createdDateTime;
        return typeormLike;
      });
      return { content, likeList };
    });

    const contentList: DomainToOrmReturnType[] = resultList.filter(
      (item) => item !== null,
    );

    if (Array.isArray(payload)) {
      return contentList;
    } else {
      return contentList[0]!;
    }
  }
}
