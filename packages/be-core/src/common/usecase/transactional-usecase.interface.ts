import { IUsecase } from './usecase.interface';

export interface ITransactionalUseCase<TUseCasePort, TUseCaseResult>
  extends IUsecase<TUseCasePort, TUseCaseResult> {
  onCommit?: (result: TUseCaseResult, port: TUseCasePort) => Promise<void>;
  onRollback?: (error: Error, port: TUseCasePort) => Promise<void>;
}
