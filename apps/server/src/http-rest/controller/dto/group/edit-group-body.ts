import { ApiPropertyOptional } from '@nestjs/swagger';

export class EditGroupBody {
  @ApiPropertyOptional({ type: 'string', description: 'change group name' })
  name?: string;

  @ApiPropertyOptional({ type: 'string', description: 'change group owner' })
  ownerId?: string;

  @ApiPropertyOptional({
    type: 'string',
    isArray: true,
    description: 'invite user',
  })
  invitedUserList?: string[];

  @ApiPropertyOptional({
    type: 'string',
    isArray: true,
    description: 'drop out members',
  })
  dropOutUserList?: string[];
}
