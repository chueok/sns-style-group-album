import { ApiProperty } from "@nestjs/swagger";

export class EditProfileImageResponse {
  @ApiProperty({ type: "string" })
  presignedUrl!: string;
}
