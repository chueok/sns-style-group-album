import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { UserSimpleUsecaseDto } from "@repo/be-core";

export class RestUserSimpleResponse implements UserSimpleUsecaseDto {
  @ApiProperty({ type: "string" })
  id!: string;

  @ApiProperty({ type: "string" })
  username!: string;

  @ApiPropertyOptional({ type: "string" })
  thumbnailRelativePath?: string;
}
