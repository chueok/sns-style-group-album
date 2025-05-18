import { ApiProperty } from '@nestjs/swagger';

export class RestResponseJwt {
  @ApiProperty({ type: 'string' })
  accessToken!: string;
}
