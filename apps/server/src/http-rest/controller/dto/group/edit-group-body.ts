import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, IsString } from "class-validator";

export class RestEditGroupBody {
  @ApiPropertyOptional({ type: "string" })
  @IsOptional()
  @IsString()
  name?: string;
}
