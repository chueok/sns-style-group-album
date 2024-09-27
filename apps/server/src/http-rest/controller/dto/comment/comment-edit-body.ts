import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";

export class RestCommentEditBody {
  @ApiProperty({ type: "string" })
  @IsString()
  id!: string;

  @ApiProperty({ type: "string" })
  @IsString()
  text!: string;
}
