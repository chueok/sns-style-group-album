import { ApiProperty } from '@nestjs/swagger';

export class RestAuthSignupBody {
  @ApiProperty({ type: 'string' })
  username!: string;

  @ApiProperty({ type: 'string' })
  email!: string;
}
