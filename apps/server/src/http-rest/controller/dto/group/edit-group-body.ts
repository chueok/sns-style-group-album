import { ApiPropertyOptional } from "@nestjs/swagger";

export class RestEditGroupBody {
  @ApiPropertyOptional({ type: "string", description: "change group name" })
  name?: string;

  @ApiPropertyOptional({ type: "string", description: "change group owner" })
  ownerId?: string;
}
