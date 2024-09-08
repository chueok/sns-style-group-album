import {
  Comment,
  CreateCommentEntityPayload,
  CommentTypeEnum,
  UserComment,
  SystemComment,
  Exception,
  Code,
  UserId,
} from "@repo/be-core";
import {
  isTypeormSystemComment,
  isTypeormUserComment,
  TypeormComment,
  TypeormSystemComment,
  TypeormUserComment,
} from "../../../entity/comment/typeorm-comment.entity";
import { TypeormUser } from "../../../entity/user/typeorm-user.entity";

export type CommentMapperToDomainPayloadType = {
  elements: { comment: TypeormComment; tags: UserId[] }[];
};

type ToDomainReturnType = {
  results: Comment[];
  errors: Error[];
};

type ToOrmPayloadType = {
  elements: Comment[];
};

type ToOrmReturnType = {
  results: TypeormComment[];
  errors: Error[];
};

export class CommentMapper {
  public static async toDomainEntity(
    payload: CommentMapperToDomainPayloadType,
  ): Promise<ToDomainReturnType> {
    const { elements } = payload;

    const results: Comment[] = [];
    const errors: Error[] = [];

    const promiseList: Promise<Comment>[] = elements.map(async (item) => {
      return CommentMapper.mapToDomainCommentForUtil(item);
    });

    const promiseAllSettledResult = await Promise.allSettled(promiseList);
    promiseAllSettledResult.forEach((result) => {
      if (result.status === "fulfilled") {
        results.push(result.value);
      } else {
        errors.push(result.reason);
      }
    });

    return {
      results,
      errors,
    };
  }

  public static toOrmEntity(payload: ToOrmPayloadType): ToOrmReturnType {
    const results: TypeormComment[] = [];
    const errors: Error[] = [];

    const { elements } = payload;

    elements.forEach((item) => {
      try {
        results.push(CommentMapper.mapToOrmCommentForUtil(item));
      } catch (error) {
        if (error instanceof Error) {
          errors.push(error);
        }
      }
    });

    return {
      results,
      errors,
    };
  }

  private static async mapToDomainCommentForUtil({
    comment,
    tags,
  }: CommentMapperToDomainPayloadType["elements"][0]): Promise<Comment> {
    if (isTypeormUserComment(comment)) {
      const ownerId = comment.ownerId;

      const commentPayload: CreateCommentEntityPayload<"user", "existing"> = {
        text: comment.text,
        contentId: comment.contentId,

        id: comment.id,
        userTags: tags,
        createdDateTime: comment.createdDateTime,
        updatedDateTime: comment.updatedDateTime,
        deletedDateTime: comment.deletedDateTime,

        ownerId,
      };

      return UserComment.new(commentPayload);
    } else if (isTypeormSystemComment(comment)) {
      const commentPayload: CreateCommentEntityPayload<"system", "existing"> = {
        text: comment.text,
        contentId: comment.contentId,

        id: comment.id,
        userTags: tags,
        createdDateTime: comment.createdDateTime,
        updatedDateTime: comment.updatedDateTime,
        deletedDateTime: comment.deletedDateTime,

        subText: (comment as TypeormSystemComment).subText,
      };
      return SystemComment.new(commentPayload);
    } else {
      throw Exception.new({
        code: Code.UTIL_PROCESS_ERROR,
        overrideMessage: "Invalid comment type.",
      });
    }
  }

  private static mapToOrmCommentForUtil(comment: Comment): TypeormComment {
    if (comment instanceof UserComment) {
      const typeormUserComment = new TypeormUserComment();
      typeormUserComment.id = comment.id;
      typeormUserComment.commentType = CommentTypeEnum.USER_COMMENT;
      typeormUserComment.text = comment.text;
      typeormUserComment.contentId = comment.contentId;

      typeormUserComment.createdDateTime = comment.createdDateTime;
      typeormUserComment.updatedDateTime = comment.updatedDateTime;
      typeormUserComment.deletedDateTime = comment.deletedDateTime;

      typeormUserComment.ownerId = comment.ownerId;

      typeormUserComment.tags = Promise.resolve(
        comment.userTags.map((userId) => {
          const user = new TypeormUser();
          user.id = userId;
          return user;
        }),
      );

      return typeormUserComment;
    } else if (comment instanceof SystemComment) {
      const typeormSystemComment = new TypeormSystemComment();
      typeormSystemComment.id = comment.id;
      typeormSystemComment.commentType = CommentTypeEnum.SYSTEM_COMMENT;
      typeormSystemComment.text = comment.text;
      typeormSystemComment.contentId = comment.contentId;

      typeormSystemComment.tags = Promise.resolve(
        comment.userTags.map((userId) => {
          const user = new TypeormUser();
          user.id = userId;
          return user;
        }),
      );

      typeormSystemComment.createdDateTime = comment.createdDateTime;
      typeormSystemComment.updatedDateTime = comment.updatedDateTime;
      typeormSystemComment.deletedDateTime = comment.deletedDateTime;

      typeormSystemComment.subText = comment.subText;

      return typeormSystemComment;
    } else {
      throw Exception.new({ code: Code.UTIL_PROCESS_ERROR });
    }
  }
}
