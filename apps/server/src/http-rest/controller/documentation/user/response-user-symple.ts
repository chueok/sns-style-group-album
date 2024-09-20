import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class RestResponseUserSymple {
  @ApiProperty({ type: "string" })
  id!: string;

  @ApiProperty({ type: "string" })
  username!: string;

  @ApiPropertyOptional({ type: "string" })
  thumbnailRelativePath?: string;
}
