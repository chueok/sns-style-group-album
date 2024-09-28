import { IsString, IsOptional } from "class-validator";
import { UseCaseValidatableAdapter } from "../../../../common/usecase/usecase-validatable-adapter";

export interface IEditUserGroupProfilePort {
  userId: string;
  groupId: string;
  nickname?: string;
}

export class EditUserGroupProfileAdapter
  extends UseCaseValidatableAdapter
  implements IEditUserGroupProfilePort
{
  @IsString()
  userId!: string;

  @IsString()
  groupId!: string;

  @IsOptional()
  @IsString()
  nickname?: string;

  static async new(
    payload: IEditUserGroupProfilePort,
  ): Promise<IEditUserGroupProfilePort> {
    const adapter = new EditUserGroupProfileAdapter();
    adapter.userId = payload.userId;
    adapter.groupId = payload.groupId;
    adapter.nickname = payload.nickname;
    await adapter.validate();
    return adapter;
  }
}
