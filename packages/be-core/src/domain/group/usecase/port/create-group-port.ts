import { IsString } from "class-validator";
import { UseCaseValidatableAdapter } from "../../../../common/usecase/usecase-validatable-adapter";

export interface ICreateGroupPort {
  ownerId: string;
  name: string;
}

export class CreateGroupAdapter
  extends UseCaseValidatableAdapter
  implements ICreateGroupPort
{
  @IsString()
  ownerId!: string;
  @IsString()
  name!: string;

  static async new(payload: ICreateGroupPort): Promise<CreateGroupAdapter> {
    const adapter = new CreateGroupAdapter();
    adapter.ownerId = payload.ownerId;
    adapter.name = payload.name;
    await adapter.validate();
    return adapter;
  }
}
