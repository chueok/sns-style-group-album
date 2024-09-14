import { SystemComment, UserComment } from "../../entity/comment";
import { Comment } from "../../entity/comment.abstract";
import { CommentTypeEnum } from "../../enum/comment-type-enum";

export class CommentDto {
  readonly id: string;

  readonly type: CommentTypeEnum;

  readonly contentId: string;

  readonly text: string;

  readonly ownerId?: string;

  readonly subText?: string;

  constructor(payload: CommentDto) {
    this.id = payload.id;
    this.type = payload.type;
    this.contentId = payload.contentId;
    this.text = payload.text;
    this.ownerId = payload.ownerId;
    this.subText = payload.subText;
  }

  public static newFromComment(comment: Comment): CommentDto {
    const dto: CommentDto = new CommentDto({
      id: comment.id,
      type: comment.type,
      contentId: comment.contentId,
      text: comment.text,
      ownerId: (comment as UserComment).ownerId || undefined,
      subText: (comment as SystemComment).subText || undefined,
    });
    return dto;
  }

  public static newListFromComments(comments: Comment[]): CommentDto[] {
    return comments.map((comment) => CommentDto.newFromComment(comment));
  }
}
