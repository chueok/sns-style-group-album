import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { ContentTypeEnum } from "@repo/be-core";
import { RestContentSimpleResponse } from "./content-simple-response";
import { RestCommentResponse } from "../comment/comment-response";

export class RestContentResponse {
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

  @ApiProperty({ type: RestContentSimpleResponse, isArray: true })
  referencedContents!: RestContentSimpleResponse[];

  @ApiPropertyOptional({ type: "string" })
  thumbnailRelativePath?: string;

  @ApiProperty({ type: "number" })
  numLikes!: number;

  @ApiProperty({ type: "string", isArray: true })
  topLikedUserIds!: string[];

  @ApiProperty({ type: "number" })
  numComments!: number;

  @ApiProperty({ type: RestCommentResponse, isArray: true })
  topComments!: RestCommentResponse[];

  @ApiProperty({ type: "number" })
  createdTimestamp!: number;

  @ApiProperty({ type: "number" })
  updatedTimestamp!: number;
}
