import { ApiProperty } from "@nestjs/swagger";

export class RestGroupResponse {
  @ApiProperty({ type: "string" })
  id!: string;

  @ApiProperty({ type: "string" })
  name!: string;

  @ApiProperty({ type: "string" })
  ownerId!: string;

  @ApiProperty({ type: "string", isArray: true })
  members!: string[];

  @ApiProperty({ type: "number" })
  createdTimestamp!: number;
}
