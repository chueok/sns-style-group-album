import { ApiProperty } from "@nestjs/swagger";
import { Group } from "@repo/be-core";

export class GroupResponseDTO {
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

  static newFromGroup(group: Group): GroupResponseDTO {
    const dto = new GroupResponseDTO();
    dto.id = group.id;
    dto.name = group.name;
    dto.ownerId = group.ownerId;
    dto.members = group.members;
    dto.createdTimestamp = group.createdDateTime.getTime();
    return dto;
  }
}
