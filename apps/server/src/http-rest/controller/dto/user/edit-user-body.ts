import { ApiPropertyOptional } from '@nestjs/swagger';

export class EditUserBody {
  @ApiPropertyOptional({ type: 'string' })
  username?: string;
}
