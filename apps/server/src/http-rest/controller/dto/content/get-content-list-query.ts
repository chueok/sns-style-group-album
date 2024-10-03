import { ApiPropertyOptional } from "@nestjs/swagger";
import { ContentPaginationOptions } from "@repo/be-core";

export class GetContentListQuery {
  @ApiPropertyOptional({ type: "number" })
  limit?: number;

  @ApiPropertyOptional({ type: "string" })
  cursor?: string;

  @ApiPropertyOptional({ type: "createdDateTime" })
  sortBy?: ContentPaginationOptions["sortBy"];

  @ApiPropertyOptional({ type: "asc | desc" })
  sortOrder?: ContentPaginationOptions["sortOrder"];
}
