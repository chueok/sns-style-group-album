import { ApiProperty } from "@nestjs/swagger";

export class RestGetUserListQuery {
  @ApiProperty({ type: "string" })
  groupId!: string;
}
