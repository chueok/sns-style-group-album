import { TComment } from '@repo/be-core';
import { TypeormComment } from '../../../typeorm/entity/comment/typeorm-comment.entity';

export class CommentMapper {
  public static toDomainEntity(payload: TypeormComment): TComment {
    const {
      id,
      groupId,
      commentCategory,
      ownerId,
      text,
      createdDateTime,
      updatedDateTime,
      deletedDateTime,
      contentId,
      subText,
      __tags__,
    } = payload;

    return {
      id,
      groupId,
      category: commentCategory,
      text,
      tags:
        __tags__?.map((tag) => ({
          at: tag.at.split(',').map(Number),
          memberId: tag.memberId,
        })) || [],
      contentId: contentId || undefined,
      ownerId: ownerId || undefined,
      subText: subText || undefined,
      createdDateTime: createdDateTime,
      updatedDateTime: updatedDateTime || undefined,
      deletedDateTime: deletedDateTime || undefined,
    };
  }

  public static toDomainEntityList(payload: TypeormComment[]): TComment[] {
    return payload.map((comment) => this.toDomainEntity(comment));
  }
}
