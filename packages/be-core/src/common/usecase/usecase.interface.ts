export interface IUsecase<TUseCasePort, TUseCaseResult> {
  execute(port?: TUseCasePort): Promise<TUseCaseResult>;
}
