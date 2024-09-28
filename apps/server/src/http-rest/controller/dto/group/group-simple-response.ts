import { ApiProperty } from "@nestjs/swagger";
import { Group } from "@repo/be-core";

export class GroupSimpleResponseDTO {
  @ApiProperty({ type: "string" })
  id!: string;

  @ApiProperty({ type: "string" })
  name!: string;

  static newFromGroup(group: Group): GroupSimpleResponseDTO {
    const dto = new GroupSimpleResponseDTO();
    dto.id = group.id;
    dto.name = group.name;
    return dto;
  }
}
