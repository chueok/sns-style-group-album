import { IsString } from 'class-validator';
import { UseCaseValidatableAdapter } from '../../../../common/usecase/usecase-validatable-adapter';

export interface IGetUserPort {
  id: string;
}

export class GetUserAdaptor
  extends UseCaseValidatableAdapter
  implements IGetUserPort
{
  @IsString()
  id!: string;

  static async new(payload: IGetUserPort): Promise<IGetUserPort> {
    const adapter = new GetUserAdaptor();
    adapter.id = payload.id;
    await adapter.validate();
    return adapter;
  }
}
