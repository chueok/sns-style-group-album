import {
  Nullable,
  Comment,
  CreateCommentEntityPayload,
  CommentTypeEnum,
  UserComment,
  SystemComment,
  CommentOwner,
  Exception,
  Code,
} from "@repo/be-core";
import {
  TypeormComment,
  TypeormSystemComment,
  TypeormUserComment,
} from "../../../entity/comment/typeorm-comment.entity";
import { TypeormContent } from "../../../entity/content/typeorm-content.entity";

type OrmToDomainPayloadType = {
  comment: TypeormComment;
  content: TypeormContent;
};

export class CommentMapper {
  public static toDomainEntity(
    payload: OrmToDomainPayloadType,
  ): Promise<Nullable<Comment>>;
  public static toDomainEntity(
    payload: OrmToDomainPayloadType[],
  ): Promise<Comment[]>;
  public static async toDomainEntity(
    payload: OrmToDomainPayloadType | OrmToDomainPayloadType[],
  ): Promise<Nullable<Comment> | Comment[]> {
    const payloadList = Array.isArray(payload) ? payload : [payload];

    const promises: Promise<Comment | null>[] = payloadList.map(
      async (item) => {
        try {
          if (item.comment.commentType === CommentTypeEnum.USER_COMMENT) {
            const typeormOwner = await (item.comment as TypeormUserComment)
              .owner;
            const owner: CommentOwner = new CommentOwner({
              id: typeormOwner.id,
              username: typeormOwner.username,
              thumbnailRelativePath: typeormOwner.thumbnailRelativePath,
            });

            const typeormTags = await (item.comment as TypeormUserComment).tags;
            const tags: CommentOwner[] = typeormTags.map((item) => {
              return new CommentOwner({
                id: item.id,
                username: item.username,
                thumbnailRelativePath: item.thumbnailRelativePath,
              });
            });
            const commentPayload: CreateCommentEntityPayload<
              "user",
              "existing"
            > = {
              text: item.comment.text,
              contentId: item.comment.contentId,
              contentThumbnailRelativePath: item.content.thumbnailRelativePath,

              id: item.comment.id,
              createdDateTime: item.comment.createdDateTime,
              updatedDateTime: item.comment.updatedDateTime,
              deletedDateTime: item.comment.deletedDateTime,

              owner,
              tags,
            };
            return UserComment.new(commentPayload);
          } else if (
            item.comment.commentType === CommentTypeEnum.SYSTEM_COMMENT
          ) {
            const commentPayload: CreateCommentEntityPayload<
              "system",
              "existing"
            > = {
              text: item.comment.text,
              contentId: item.comment.contentId,
              contentThumbnailRelativePath: item.content.thumbnailRelativePath,

              id: item.comment.id,
              createdDateTime: item.comment.createdDateTime,
              updatedDateTime: item.comment.updatedDateTime,
              deletedDateTime: item.comment.deletedDateTime,

              subText: (item.comment as TypeormSystemComment).subText,
            };
            return SystemComment.new(commentPayload);
          } else {
            // TODO Error log
            return null;
          }
        } catch (error) {
          // TODO Error log
          return null;
        }
      },
    );

    const domainEntities: Comment[] = (await Promise.all(promises)).filter(
      (item) => item !== null,
    );

    if (Array.isArray(payload)) {
      return domainEntities;
    } else {
      return domainEntities[0] || null;
    }
  }

  public static toOrmEntity(payload: Comment): TypeormComment;
  public static toOrmEntity(payload: Comment[]): TypeormComment[];
  public static toOrmEntity(
    payload: Comment | Comment[],
  ): TypeormComment | TypeormComment[] {
    const payloadList = Array.isArray(payload) ? payload : [payload];

    const commentList = payloadList.map((item) => {
      if (item instanceof UserComment) {
        const typeormUserComment = new TypeormUserComment();
        typeormUserComment.id = item.id;
        typeormUserComment.commentType = CommentTypeEnum.USER_COMMENT;
        typeormUserComment.text = item.text;
        typeormUserComment.contentId = item.contentId;

        typeormUserComment.createdDateTime = item.createdDateTime;
        typeormUserComment.updatedDateTime = item.updatedDateTime;
        typeormUserComment.deletedDateTime = item.deletedDateTime;

        typeormUserComment.ownerId = item.owner.id;

        // TODO Tags 생성 시 User의 전체 정보를 알아야 함...
        // 일부 userId만 가지고 tag생성 할 수 있도록 개선 필요
        // typeormUserComment.tags = Promise.resolve([]);

        return typeormUserComment;
      } else if (item instanceof SystemComment) {
        const typeormSystemComment = new TypeormSystemComment();
        typeormSystemComment.id = item.id;
        typeormSystemComment.commentType = CommentTypeEnum.SYSTEM_COMMENT;
        typeormSystemComment.text = item.text;
        typeormSystemComment.contentId = item.contentId;

        typeormSystemComment.createdDateTime = item.createdDateTime;
        typeormSystemComment.updatedDateTime = item.updatedDateTime;
        typeormSystemComment.deletedDateTime = item.deletedDateTime;

        typeormSystemComment.subText = item.subText;

        return typeormSystemComment;
      } else {
        throw Exception.new({ code: Code.ENTITY_VALIDATION_ERROR });
      }
    });

    if (Array.isArray(payload)) {
      return commentList;
    } else {
      return commentList[0]!;
    }
  }
}
