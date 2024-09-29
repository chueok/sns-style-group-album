import { ArrayNotEmpty, IsArray, IsNotEmpty, IsString } from "class-validator";
import { UseCaseValidatableAdapter } from "../../../../common/usecase/usecase-validatable-adapter";

export interface IInviteUserPort {
  groupId: string;
  invitedUserList: string[];
}

export class InviteUserAdapter
  extends UseCaseValidatableAdapter
  implements IInviteUserPort
{
  @IsString()
  groupId!: string;

  @ArrayNotEmpty()
  @IsString({ each: true })
  invitedUserList!: string[];

  static async new(payload: IInviteUserPort): Promise<InviteUserAdapter> {
    const adapter = new InviteUserAdapter();
    adapter.groupId = payload.groupId;
    adapter.invitedUserList = payload.invitedUserList;
    await adapter.validate();
    return adapter;
  }
}
