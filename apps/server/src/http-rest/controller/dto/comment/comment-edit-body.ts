import { ApiProperty } from '@nestjs/swagger';

export class CommentEditBody {
  @ApiProperty({ type: 'string' })
  id!: string;

  @ApiProperty({ type: 'string' })
  text!: string;
}
