import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  Comment,
  CommentId,
  CommentTypeEnum,
  ContentId,
  SystemComment,
  UserComment,
} from "@repo/be-core";

class CommentUserTagResponseDTO {
  @ApiProperty({ type: "string" })
  userId!: string;

  @ApiProperty({ type: "number", isArray: true })
  at!: number[];
}

export class CommentResponseDTO {
  @ApiProperty({ type: "string" })
  id!: CommentId;

  @ApiProperty({ enum: CommentTypeEnum })
  type!: CommentTypeEnum;

  @ApiProperty({ type: "string" })
  contentId!: ContentId;

  @ApiProperty({ type: "string" })
  text!: string;

  @ApiProperty({ type: CommentUserTagResponseDTO, isArray: true })
  userTags!: CommentUserTagResponseDTO[];

  @ApiPropertyOptional({ type: "string" })
  ownerId?: string;

  @ApiPropertyOptional({ type: "string" })
  subText?: string;

  public static newFromComment(comment: Comment): CommentResponseDTO {
    const dto: CommentResponseDTO = new CommentResponseDTO();
    dto.id = comment.id;
    dto.type = comment.type;
    dto.contentId = comment.contentId;
    dto.text = comment.text;
    dto.userTags = comment.userTags.map((tag) => {
      return {
        userId: tag.userId,
        at: tag.at,
      };
    });
    dto.ownerId = (comment as UserComment).ownerId || undefined;
    dto.subText = (comment as SystemComment).subText || undefined;
    return dto;
  }

  public static newListFromComments(comments: Comment[]): CommentResponseDTO[] {
    return comments.map((comment) =>
      CommentResponseDTO.newFromComment(comment),
    );
  }
}
