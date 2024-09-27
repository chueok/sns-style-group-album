import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, IsString } from "class-validator";

export class RestEditUserBody {
  @ApiPropertyOptional({ type: "string" })
  @IsOptional()
  @IsString()
  username?: string;
}
