import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsOptional, IsString } from "class-validator";

export class RestAuthSignupBody {
  @ApiProperty({ type: "string" })
  @IsString()
  username!: string;

  @ApiProperty({ type: "string" })
  @IsEmail()
  email!: string;

  @ApiProperty({ type: "string" })
  @IsOptional()
  @IsString()
  thumbnailRelativePath?: string;
}
