import { ApiPropertyOptional } from '@nestjs/swagger';

export class UserGroupProfileBody {
  @ApiPropertyOptional({ type: 'string' })
  nickname?: string;
}
