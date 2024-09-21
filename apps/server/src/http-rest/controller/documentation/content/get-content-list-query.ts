import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, IsString } from "class-validator";

export class RestGetContentListQuery {
  @ApiPropertyOptional({ type: "string" })
  @IsOptional()
  @IsString()
  userId?: string;

  @ApiPropertyOptional({ type: "string" })
  @IsOptional()
  @IsString()
  groupId?: string;
}
