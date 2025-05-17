import { IsUUID } from 'class-validator';
import { UseCaseValidatableAdapter } from '../../../../common/usecase/usecase-validatable-adapter';

export interface IDeleteContentPort {
  contentId: string;
}

export class DeleteContentAdapter
  extends UseCaseValidatableAdapter
  implements IDeleteContentPort
{
  @IsUUID('4')
  contentId!: string;

  public static async new(payload: IDeleteContentPort) {
    const adapter = new DeleteContentAdapter();
    adapter.contentId = payload.contentId;
    return adapter;
  }
}
