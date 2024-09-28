import { ApiProperty } from "@nestjs/swagger";

export class RestCreateGroupBody {
  @ApiProperty({ type: "string" })
  name!: string;
}
