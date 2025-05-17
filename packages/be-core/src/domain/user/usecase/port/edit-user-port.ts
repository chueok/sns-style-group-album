import { IsOptional, IsString } from 'class-validator';
import { UseCaseValidatableAdapter } from '../../../../common/usecase/usecase-validatable-adapter';

export interface IEditUserPort {
  userId: string;
  username?: string;
}

export class EditUserAdapter
  extends UseCaseValidatableAdapter
  implements IEditUserPort
{
  @IsString()
  userId!: string;

  @IsOptional()
  @IsString()
  username?: string;

  static async new(payload: IEditUserPort): Promise<IEditUserPort> {
    const adapter = new EditUserAdapter();
    adapter.userId = payload.userId;
    adapter.username = payload.username;
    await adapter.validate();
    return adapter;
  }
}
