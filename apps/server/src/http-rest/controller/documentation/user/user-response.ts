import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { UserUsecaseDto } from "@repo/be-core";

export class RestUserResponse implements UserUsecaseDto {
  @ApiProperty({ type: "string" })
  id!: string;

  @ApiProperty({ type: "string" })
  username!: string;

  @ApiPropertyOptional({ type: "string" })
  email?: string;

  @ApiPropertyOptional({ type: "string" })
  thumbnailRelativePath?: string;

  @ApiProperty({ type: "string", isArray: true })
  groups!: string[];

  @ApiProperty({ type: "string", isArray: true })
  ownGroups!: string[];

  @ApiProperty({ type: "number" })
  createdTimestamp!: number;

  @ApiPropertyOptional({ type: "number" })
  updatedTimestamp?: number;
}
