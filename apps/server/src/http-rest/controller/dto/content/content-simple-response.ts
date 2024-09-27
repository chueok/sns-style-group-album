import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { ContentTypeEnum } from "@repo/be-core";

export class RestContentSimpleResponse {
  @ApiProperty({ type: "string" })
  id!: string;

  @ApiProperty({ type: "string" })
  groupId!: string;

  @ApiProperty({ enum: ContentTypeEnum })
  type!: ContentTypeEnum;

  @ApiProperty({ type: "string" })
  ownerId!: string;

  @ApiPropertyOptional({ type: "string" })
  thumbnailRelativePath?: string;

  @ApiProperty({ type: "number" })
  numLikes!: number;

  @ApiProperty({ type: "number" })
  numComments!: number;

  @ApiProperty({ type: "number" })
  createdTimestamp!: number;
}
