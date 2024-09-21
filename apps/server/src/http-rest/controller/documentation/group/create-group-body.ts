import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";

export class RestCreateGroupBody {
  @ApiProperty({ type: "string" })
  @IsString()
  name!: string;
}
