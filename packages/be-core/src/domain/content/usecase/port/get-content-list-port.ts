import { IsIn, IsNumber, IsOptional, IsString } from 'class-validator';
import { UseCaseValidatableAdapter } from '../../../../common/usecase/usecase-validatable-adapter';

export interface IGetContentListPort {
  groupId: string;

  limit: number;
  cursor?: string;
  sortBy: 'createdDateTime';
  sortOrder: 'asc' | 'desc';
}

export class GetContentListAdapter
  extends UseCaseValidatableAdapter
  implements IGetContentListPort
{
  @IsString()
  groupId!: string;

  @IsNumber()
  limit!: number;

  @IsOptional()
  @IsString()
  cursor?: string;

  @IsIn(['createdDateTime'])
  sortBy!: 'createdDateTime';

  @IsIn(['asc', 'desc'])
  sortOrder!: 'asc' | 'desc';

  static async new(
    payload: IGetContentListPort
  ): Promise<GetContentListAdapter> {
    const adapter = new GetContentListAdapter();
    adapter.groupId = payload.groupId;
    adapter.limit = payload.limit;
    adapter.cursor = payload.cursor;
    adapter.sortBy = payload.sortBy;
    adapter.sortOrder = payload.sortOrder;
    await adapter.validate();
    return adapter;
  }
}
