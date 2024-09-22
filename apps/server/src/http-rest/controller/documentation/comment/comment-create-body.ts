import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";

export class RestCommentCreateBody {
  @ApiProperty({ type: "string" })
  @IsString()
  contentId!: string;

  @ApiProperty({ type: "string" })
  @IsString()
  text!: string;
}
