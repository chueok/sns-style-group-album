import { ApiPropertyOptional } from "@nestjs/swagger";

export class RestGetCommentListQuery {
  @ApiPropertyOptional({ type: "string" })
  userId?: string;

  @ApiPropertyOptional({ type: "string" })
  contentId?: string;
}
