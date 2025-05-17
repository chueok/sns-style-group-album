import { IsString } from 'class-validator';
import { UseCaseValidatableAdapter } from '../../../../common/usecase/usecase-validatable-adapter';

export interface IDeleteGroupPort {
  groupId: string;
}

export class DeleteGroupAdapter
  extends UseCaseValidatableAdapter
  implements IDeleteGroupPort
{
  @IsString()
  groupId!: string;

  public static async new(
    payload: IDeleteGroupPort
  ): Promise<DeleteGroupAdapter> {
    const adapter = new DeleteGroupAdapter();
    adapter.groupId = payload.groupId;
    await adapter.validate();
    return adapter;
  }
}
