// TODO : Port 이름을 계속 쓸지는 usecase 하나를 구현해보고 결정.
export interface IUsecase<TUseCasePort, TUseCaseResult> {
  execute(port?: TUseCasePort): Promise<TUseCaseResult>;
}
