import { ApiPropertyOptional } from '@nestjs/swagger';

export class GetCommentListQuery {
  @ApiPropertyOptional({ type: 'string' })
  userId?: string;

  @ApiPropertyOptional({ type: 'string' })
  contentId?: string;
}
