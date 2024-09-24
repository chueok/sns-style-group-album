import { Code } from "../../../common/exception/code";
import { Exception } from "../../../common/exception/exception";
import { IUsecase } from "../../../common/usecase/usecase.interface";
import { IUserRepository } from "../repository/user-repository.interface";
import { IDeleteUserPort } from "./port/delete-user-port";

export class DeleteUserUsecase implements IUsecase<IDeleteUserPort, void> {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(port: IDeleteUserPort): Promise<void> {
    const result = await this.userRepository.deleteUserById(port.id);
    if (!result) {
      throw Exception.new({
        code: Code.ENTITY_NOT_FOUND_ERROR,
        overrideMessage: "user is not exist",
      });
    }
  }
}
