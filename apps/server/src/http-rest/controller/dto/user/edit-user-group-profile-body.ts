import { ApiPropertyOptional } from "@nestjs/swagger";

export class EditUserGroupProfileBody {
  @ApiPropertyOptional({ type: "string" })
  nickname?: string;
}
