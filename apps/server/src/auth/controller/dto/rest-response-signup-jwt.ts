import { ApiProperty } from '@nestjs/swagger';

export class RestResponseSignupJwt {
  @ApiProperty({ type: 'string' })
  signupToken!: string;
}
