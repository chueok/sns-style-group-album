import { IsString } from "class-validator";
import { UseCaseValidatableAdapter } from "../../../../common/usecase/usecase-validatable-adapter";

export interface IGetOwnGroupListPort {
  userId: string;
}

export class GetOwnGroupListAdapter
  extends UseCaseValidatableAdapter
  implements IGetOwnGroupListPort
{
  @IsString()
  userId!: string;

  public static async new(
    payload: IGetOwnGroupListPort,
  ): Promise<GetOwnGroupListAdapter> {
    const adapter = new GetOwnGroupListAdapter();
    adapter.userId = payload.userId;
    await adapter.validate();
    return adapter;
  }
}
