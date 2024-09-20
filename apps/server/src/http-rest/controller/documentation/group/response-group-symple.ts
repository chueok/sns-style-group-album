import { ApiProperty } from "@nestjs/swagger";

export class RestResponseGroupSymple {
  @ApiProperty({ type: "string" })
  id!: string;

  @ApiProperty({ type: "string" })
  name!: string;
}
