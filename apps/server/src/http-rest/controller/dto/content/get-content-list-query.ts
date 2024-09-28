import { ApiPropertyOptional } from "@nestjs/swagger";

export class RestGetContentListQuery {
  @ApiPropertyOptional({ type: "string" })
  userId?: string;

  @ApiPropertyOptional({ type: "string" })
  groupId?: string;
}
