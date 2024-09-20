import { ApiPropertyOptional } from "@nestjs/swagger";

export class RestEditGroupBody {
  @ApiPropertyOptional({ type: "string" })
  name?: string;
}
