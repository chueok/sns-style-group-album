import { IsString } from "class-validator";
import { UseCaseValidatableAdapter } from "../../../../common/usecase/usecase-validatable-adapter";

export interface IGetGroupMembersPort {
  groupId: string;
}

export class GetGroupMembersAdaptor
  extends UseCaseValidatableAdapter
  implements IGetGroupMembersPort
{
  @IsString()
  groupId!: string;

  static async new(
    payload: IGetGroupMembersPort,
  ): Promise<IGetGroupMembersPort> {
    const adapter = new GetGroupMembersAdaptor();
    adapter.groupId = payload.groupId;
    await adapter.validate();
    return adapter;
  }
}
