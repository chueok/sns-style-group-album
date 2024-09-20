import { ApiPropertyOptional } from "@nestjs/swagger";

export class RestEditUserBody {
  @ApiPropertyOptional({ type: "string" })
  username?: string;
}
