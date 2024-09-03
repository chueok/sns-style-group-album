import {
  Comment,
  CreateCommentEntityPayload,
  CommentTypeEnum,
  UserComment,
  SystemComment,
  Exception,
  Code,
} from "@repo/be-core";
import {
  isTypeormSystemComment,
  isTypeormUserComment,
  TypeormComment,
  TypeormSystemComment,
  TypeormUserComment,
} from "../../../entity/comment/typeorm-comment.entity";
import { TypeormUser } from "../../../entity/user/typeorm-user.entity";

type OrmToDomainPayloadType = {
  comment: TypeormComment;
};

type OrmToDomainReturnType = {
  results: Comment[];
  errors: Error[];
};

type DomainToOrmPayloadType = {
  comment: Comment;
};

type DomainToOrmReturnType = {
  results: TypeormComment[];
  errors: Error[];
};

export class CommentMapper {
  public static async toDomainEntity(
    payload: OrmToDomainPayloadType[],
  ): Promise<OrmToDomainReturnType> {
    const results: Comment[] = [];
    const errors: Error[] = [];

    const promiseList: Promise<Comment>[] = payload.map(async (item) => {
      return CommentMapper.transferFromOrmToDomain(item);
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

  public static toOrmEntity(
    payload: DomainToOrmPayloadType[],
  ): DomainToOrmReturnType {
    const results: TypeormComment[] = [];
    const errors: Error[] = [];

    payload.forEach((item) => {
      try {
        results.push(CommentMapper.transferFromDomainToOrm(item));
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

  private static async transferFromOrmToDomain(
    payload: OrmToDomainPayloadType,
  ): Promise<Comment> {
    if (isTypeormUserComment(payload.comment)) {
      const ownerId = payload.comment.ownerId;

      const typeormTags = await payload.comment.tags;
      const userTags: string[] = typeormTags.map((item) => {
        return item.id;
      });

      const commentPayload: CreateCommentEntityPayload<"user", "existing"> = {
        text: payload.comment.text,
        contentId: payload.comment.contentId,

        id: payload.comment.id,
        userTags: userTags,
        createdDateTime: payload.comment.createdDateTime,
        updatedDateTime: payload.comment.updatedDateTime,
        deletedDateTime: payload.comment.deletedDateTime,

        ownerId,
      };

      return UserComment.new(commentPayload);
    } else if (isTypeormSystemComment(payload.comment)) {
      const typeormTags = await payload.comment.tags;
      const userTags: string[] = typeormTags.map((item) => {
        return item.id;
      });
      const commentPayload: CreateCommentEntityPayload<"system", "existing"> = {
        text: payload.comment.text,
        contentId: payload.comment.contentId,

        id: payload.comment.id,
        userTags: userTags,
        createdDateTime: payload.comment.createdDateTime,
        updatedDateTime: payload.comment.updatedDateTime,
        deletedDateTime: payload.comment.deletedDateTime,

        subText: (payload.comment as TypeormSystemComment).subText,
      };
      return SystemComment.new(commentPayload);
    } else {
      throw Exception.new({
        code: Code.UTIL_PROCESS_ERROR,
        overrideMessage: "Invalid comment type.",
      });
    }
  }

  private static transferFromDomainToOrm(
    payload: DomainToOrmPayloadType,
  ): TypeormComment {
    const comment = payload.comment;
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
