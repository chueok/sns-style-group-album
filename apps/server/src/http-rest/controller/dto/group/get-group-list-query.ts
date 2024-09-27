import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, IsString } from "class-validator";

export class RestGetGroupListQuery {
  @ApiPropertyOptional({ type: "string" })
  @IsOptional()
  @IsString()
  memberId?: string;

  @ApiPropertyOptional({ type: "string" })
  @IsOptional()
  @IsString()
  ownerId?: string;
}
