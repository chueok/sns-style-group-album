import { IsOptional, IsString } from "class-validator";
import { UseCaseValidatableAdapter } from "../../../../common/usecase/usecase-validatable-adapter";

export interface IEditGroupPort {
  groupId: string;
  ownerId?: string;
  name?: string;
}

export class EditGroupAdapter
  extends UseCaseValidatableAdapter
  implements IEditGroupPort
{
  @IsString()
  groupId!: string;

  @IsOptional()
  @IsString()
  ownerId?: string;

  @IsOptional()
  @IsString()
  name?: string;

  static async new(payload: IEditGroupPort): Promise<EditGroupAdapter> {
    const adapter = new EditGroupAdapter();
    adapter.groupId = payload.groupId;
    adapter.ownerId = payload.ownerId;
    adapter.name = payload.name;
    await adapter.validate();
    return adapter;
  }
}