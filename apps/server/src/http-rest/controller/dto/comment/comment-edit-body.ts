import { ApiProperty } from "@nestjs/swagger";

export class RestCommentEditBody {
  @ApiProperty({ type: "string" })
  id!: string;

  @ApiProperty({ type: "string" })
  text!: string;
}
