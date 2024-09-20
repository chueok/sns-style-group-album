import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { ContentTypeEnum } from "@repo/be-core";
import { RestResponseContentSymple } from "./response-content-symple";
import { RestResponseComment } from "../comment/rest-response-comment";

export class RestResponseContentDetail {
  @ApiProperty({ type: "string" })
  id!: string;

  @ApiProperty({ type: "string" })
  groupId!: string;

  @ApiProperty({ enum: ContentTypeEnum })
  type!: ContentTypeEnum;

  @ApiProperty({ type: "string" })
  ownerId!: string;

  @ApiProperty({ type: "string" })
  text!: string;

  @ApiProperty({ type: RestResponseContentSymple, isArray: true })
  referencedContents!: RestResponseContentSymple[];

  @ApiPropertyOptional({ type: "string" })
  thumbnailRelativePath?: string;

  @ApiProperty({ type: "number" })
  numLikes!: number;

  @ApiProperty({ type: "string", isArray: true })
  topLikedUserIds!: string[];

  @ApiProperty({ type: "number" })
  numComments!: number;

  @ApiProperty({ type: RestResponseComment, isArray: true })
  topComments!: RestResponseComment[];

  @ApiProperty({ type: "number" })
  createdTimestamp!: number;

  @ApiProperty({ type: "number" })
  updatedTimestamp!: number;
}
