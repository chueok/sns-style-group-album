import { UseCaseValidatableAdapter } from "../../../../common/usecase/usecase-validatable-adapter";

export interface IDeleteUserPort {
  id: string;
}

export class DeleteUserAdapter
  extends UseCaseValidatableAdapter
  implements IDeleteUserPort
{
  id!: string;

  static async new(payload: IDeleteUserPort): Promise<IDeleteUserPort> {
    const adapter = new DeleteUserAdapter();
    adapter.id = payload.id;
    await adapter.validate();
    return adapter;
  }
}
