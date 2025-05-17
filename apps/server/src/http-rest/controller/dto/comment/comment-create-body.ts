import { ApiProperty } from '@nestjs/swagger';

export class CreateUserCommentBody {
  @ApiProperty({ type: 'string' })
  contentId!: string;

  @ApiProperty({ type: 'string' })
  text!: string;
}
