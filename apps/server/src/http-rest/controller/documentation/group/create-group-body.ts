import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";

// TODO : documentation 폴더를 별도로 가져가지 않고, controller 폴더를 domain별로 나누고, 그 안에 dto 폴더에서 body, query, response 관리 필요
export class RestCreateGroupBody {
  @ApiProperty({ type: "string" })
  @IsString()
  name!: string;
}
