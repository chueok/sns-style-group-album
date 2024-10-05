import { ApiProperty } from "@nestjs/swagger";

export class CreateMediaListContentBody {
  @ApiProperty({ type: "number" })
  numContent!: number;
}
