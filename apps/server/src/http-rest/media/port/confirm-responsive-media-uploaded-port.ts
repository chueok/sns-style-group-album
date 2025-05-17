import { UseCaseValidatableAdapter } from '@repo/be-core';
import { IsOptional, IsString, IsUUID } from 'class-validator';

export interface IConfirmResponsiveMediaUploadedPort {
  id: string;
  thumbnailRelativePath?: string;
  largeRelativePath?: string;
}

export class ConfirmResponsiveMediaUploadedAdapter
  extends UseCaseValidatableAdapter
  implements IConfirmResponsiveMediaUploadedPort
{
  @IsUUID('4')
  id!: string;

  @IsOptional()
  @IsString()
  thumbnailRelativePath?: string;

  @IsOptional()
  @IsString()
  largeRelativePath?: string;

  public static async new(
    payload: IConfirmResponsiveMediaUploadedPort
  ): Promise<ConfirmResponsiveMediaUploadedAdapter> {
    const adapter = new ConfirmResponsiveMediaUploadedAdapter();
    adapter.id = payload.id;
    adapter.thumbnailRelativePath = payload.thumbnailRelativePath;
    adapter.largeRelativePath = payload.largeRelativePath;
    await adapter.validate();
    return adapter;
  }
}
