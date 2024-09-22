import { ApiProperty } from "@nestjs/swagger";

export class RestGroupSimpleResponse {
  @ApiProperty({ type: "string" })
  id!: string;

  @ApiProperty({ type: "string" })
  name!: string;
}
