import { ApiProperty } from '@nestjs/swagger';

export class EditContentBody {
  @ApiProperty({ type: 'string' })
  text!: string;
}
