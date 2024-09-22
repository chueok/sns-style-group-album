import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class RestUserSimpleResponse {
  @ApiProperty({ type: "string" })
  id!: string;

  @ApiProperty({ type: "string" })
  username!: string;

  @ApiPropertyOptional({ type: "string" })
  thumbnailRelativePath?: string;
}
