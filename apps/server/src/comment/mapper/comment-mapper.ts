import { TComment } from '@repo/be-core';
import { TypeormComment } from '../../infrastructure/persistence/typeorm/entity/comment/typeorm-comment.entity';

export class CommentMapper {
  public static toDomainEntity(payload: TypeormComment): TComment {
    const {
      id,
      commentCategory,
      ownerId,
      text,
      createdDateTime,
      updatedDateTime,
      deletedDateTime,
      contentId,
      subText,
    } = payload;

    return {
      id,
      category: commentCategory,
      text,
      userTags: [], // TODO: 유저 태그 추가 필요
      contentId: contentId,
      ownerId: ownerId || null,
      subText: subText,
      createdDateTime: createdDateTime,
      updatedDateTime: updatedDateTime,
      deletedDateTime: deletedDateTime,
    };
  }

  public static toDomainEntityList(payload: TypeormComment[]): TComment[] {
    return payload.map((comment) => this.toDomainEntity(comment));
  }
}
