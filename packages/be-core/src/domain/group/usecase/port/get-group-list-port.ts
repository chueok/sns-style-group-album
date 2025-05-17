import { IsString } from 'class-validator';
import { UseCaseValidatableAdapter } from '../../../../common/usecase/usecase-validatable-adapter';

export interface IGetGroupListPort {
  userId: string;
}

export class GetGroupListAdapter
  extends UseCaseValidatableAdapter
  implements IGetGroupListPort
{
  @IsString()
  userId!: string;

  static async new(params: IGetGroupListPort): Promise<GetGroupListAdapter> {
    const adapter = new GetGroupListAdapter();
    adapter.userId = params.userId;
    await adapter.validate();
    return adapter;
  }
}
