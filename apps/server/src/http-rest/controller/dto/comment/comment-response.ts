import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { CommentId, CommentTypeEnum, ContentId } from "@repo/be-core";

export class RestCommentResponse {
  @ApiProperty({ type: "string" })
  id!: CommentId;

  @ApiProperty({ enum: CommentTypeEnum })
  type!: CommentTypeEnum;

  @ApiProperty({ type: "string" })
  contentId!: ContentId;

  @ApiProperty({ type: "string" })
  text!: string;

  @ApiPropertyOptional({ type: "string" })
  subText?: string;
}
