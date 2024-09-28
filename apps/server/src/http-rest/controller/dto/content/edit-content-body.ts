import { ApiProperty } from "@nestjs/swagger";

export class RestEditContentBody {
  @ApiProperty({ type: "string" })
  text!: string;
}
