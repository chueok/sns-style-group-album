import { ApiPropertyOptional } from "@nestjs/swagger";

export class RestGetGroupListQuery {
  @ApiPropertyOptional({ type: "string" })
  memberId?: string;

  @ApiPropertyOptional({ type: "string" })
  ownerId?: string;
}
