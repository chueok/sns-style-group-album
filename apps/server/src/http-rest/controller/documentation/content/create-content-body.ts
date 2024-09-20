import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { BucketStatusEnum, ContentTypeEnum } from "@repo/be-core";

export class RestCreateContentBody {
  @ApiProperty({ type: "string" })
  groupId!: string;

  @ApiProperty({ type: "string", isArray: true })
  referencedContentIds!: string[];

  @ApiProperty({ enum: ContentTypeEnum })
  type!: ContentTypeEnum;

  @ApiPropertyOptional({ type: "string" })
  title?: string;

  @ApiPropertyOptional({ type: "string" })
  text?: string;

  @ApiPropertyOptional({ enum: BucketStatusEnum })
  status?: BucketStatusEnum;

  @ApiPropertyOptional({ type: "number" })
  endTimestamp?: number;

  @ApiPropertyOptional({ type: "number" })
  startTimestamp?: number;

  @ApiPropertyOptional({ type: "boolean" })
  isAllDay?: boolean;
}
