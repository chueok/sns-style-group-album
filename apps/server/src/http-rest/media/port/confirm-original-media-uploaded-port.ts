import { UseCaseValidatableAdapter } from '@repo/be-core';
import { IsMimeType, IsNumber, IsString, IsUUID } from 'class-validator';

export interface IConfirmOriginalMediaUploadedPort {
  id: string;
  originalRelativePath: string;
  size: number;
  ext: string;
  mimetype: string;
}

export class ConfirmMediaUploadedAdapter
  extends UseCaseValidatableAdapter
  implements IConfirmOriginalMediaUploadedPort
{
  @IsUUID('4')
  id!: string;

  @IsString()
  originalRelativePath!: string;

  @IsNumber()
  size!: number;

  @IsString()
  ext!: string;

  @IsMimeType()
  mimetype!: string;

  public static async new(
    payload: IConfirmOriginalMediaUploadedPort
  ): Promise<ConfirmMediaUploadedAdapter> {
    const adapter = new ConfirmMediaUploadedAdapter();
    adapter.id = payload.id;
    adapter.originalRelativePath = payload.originalRelativePath;
    adapter.size = payload.size;
    adapter.ext = payload.ext;
    adapter.mimetype = payload.mimetype;
    await adapter.validate();
    return adapter;
  }
}
