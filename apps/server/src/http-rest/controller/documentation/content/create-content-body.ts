import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { BucketStatusEnum, ContentTypeEnum } from "@repo/be-core";
import {
  IsBoolean,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
} from "class-validator";

export class RestCreateContentBody {
  @ApiProperty({ type: "string" })
  @IsString()
  groupId!: string;

  @ApiProperty({ type: "string", isArray: true })
  @IsString({ each: true })
  referencedContentIds!: string[];

  @ApiProperty({ enum: ContentTypeEnum })
  @IsEnum(ContentTypeEnum)
  type!: ContentTypeEnum;

  @ApiPropertyOptional({ type: "string" })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional({ type: "string" })
  @IsOptional()
  @IsString()
  text?: string;

  @ApiPropertyOptional({ enum: BucketStatusEnum })
  @IsOptional()
  @IsEnum(BucketStatusEnum)
  status?: BucketStatusEnum;

  @ApiPropertyOptional({ type: "number" })
  @IsOptional()
  @IsNumber()
  endTimestamp?: number;

  @ApiPropertyOptional({ type: "number" })
  @IsOptional()
  @IsNumber()
  startTimestamp?: number;

  @ApiPropertyOptional({ type: "boolean" })
  @IsBoolean()
  isAllDay?: boolean;
}
