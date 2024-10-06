import { ApiProperty } from "@nestjs/swagger";

export class CommentCreateBody {
  @ApiProperty({ type: "string" })
  contentId!: string;

  @ApiProperty({ type: "string" })
  text!: string;
}
