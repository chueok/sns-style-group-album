import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";

export class RestEditContentBody {
  @ApiProperty({ type: "string" })
  @IsString()
  text!: string;
}
