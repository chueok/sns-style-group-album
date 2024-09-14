import { ApiProperty } from "@nestjs/swagger";

export class RestCommentCreateBody {
  @ApiProperty({ type: "string" })
  contentId!: string;

  @ApiProperty({ type: "string" })
  text!: string;
}
