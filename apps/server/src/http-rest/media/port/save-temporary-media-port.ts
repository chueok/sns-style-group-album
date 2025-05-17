import { UseCaseValidatableAdapter } from '@repo/be-core';
import { IsUUID } from 'class-validator';

export interface ISaveTemporaryMediaPort {
  groupId: string;
  ownerId: string;
}

export class SaveTemporaryMediaAdapter
  extends UseCaseValidatableAdapter
  implements ISaveTemporaryMediaPort
{
  @IsUUID('4')
  groupId!: string;

  @IsUUID('4')
  ownerId!: string;

  public static async new(payload: ISaveTemporaryMediaPort) {
    const adapter = new SaveTemporaryMediaAdapter();
    adapter.groupId = payload.groupId;
    adapter.ownerId = payload.ownerId;
    await adapter.validate();
    return adapter;
  }
}
