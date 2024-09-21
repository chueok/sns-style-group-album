import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";

export class RestGetUserListQuery {
  @ApiProperty({ type: "string" })
  @IsString()
  groupId!: string;
}
