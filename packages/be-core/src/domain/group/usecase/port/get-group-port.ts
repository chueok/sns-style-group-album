import { IsString } from "class-validator";
import { UseCaseValidatableAdapter } from "../../../../common/usecase/usecase-validatable-adapter";

export interface IGetGroupPort {
  groupId: string;
}

export class GetGroupAdapter
  extends UseCaseValidatableAdapter
  implements IGetGroupPort
{
  @IsString()
  groupId!: string;

  static async new(payload: IGetGroupPort): Promise<IGetGroupPort> {
    const adapter = new GetGroupAdapter();
    adapter.groupId = payload.groupId;
    await adapter.validate();
    return adapter;
  }
}
