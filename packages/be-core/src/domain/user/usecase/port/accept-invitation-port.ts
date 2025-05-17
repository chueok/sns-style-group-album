import { IsString } from 'class-validator';
import { UseCaseValidatableAdapter } from '../../../../common/usecase/usecase-validatable-adapter';

export interface IAcceptInvitationPort {
  userId: string;
  groupId: string;
}

export class AcceptInvitationAdapter
  extends UseCaseValidatableAdapter
  implements IAcceptInvitationPort
{
  @IsString()
  userId!: string;

  @IsString()
  groupId!: string;

  public static async new(
    payload: IAcceptInvitationPort
  ): Promise<AcceptInvitationAdapter> {
    const adapter = new AcceptInvitationAdapter();
    adapter.userId = payload.userId;
    adapter.groupId = payload.groupId;
    await adapter.validate();
    return adapter;
  }
}
