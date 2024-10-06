import { ApiProperty } from "@nestjs/swagger";

export class CreateGroupBody {
  @ApiProperty({ type: "string" })
  name!: string;
}
