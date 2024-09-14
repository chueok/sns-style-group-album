import { ApiProperty } from "@nestjs/swagger";
import { CommentId, CommentTypeEnum, ContentId } from "@repo/be-core";

export class RestResponseComment {
  @ApiProperty({ type: "string" })
  id!: CommentId;

  @ApiProperty({ enum: CommentTypeEnum })
  type!: CommentTypeEnum;

  @ApiProperty({ type: "string" })
  contentId!: ContentId;

  @ApiProperty({ type: "string" })
  text!: string;

  @ApiProperty({ type: "string" })
  subText?: string;
}
