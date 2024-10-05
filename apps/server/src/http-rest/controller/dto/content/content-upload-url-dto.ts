import { ApiProperty } from "@nestjs/swagger";

export class ContentUploadUrlDTO {
  @ApiProperty({ type: "url", isArray: true })
  presignedUrlList: string[] = [];
}
