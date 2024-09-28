import { ApiProperty } from "@nestjs/swagger";

export class EditProfileImageResponseDTO {
  @ApiProperty({ type: "string" })
  presignedUrl!: string;
}
