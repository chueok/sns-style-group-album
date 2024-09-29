import { Code } from "../../../common/exception/code";
import { Exception } from "../../../common/exception/exception";
import { IUsecase } from "../../../common/usecase/usecase.interface";
import { IUserRepository } from "../repository/user-repository.interface";
import { IDeleteUserPort } from "./port/delete-user-port";

export class DeleteUserUsecase implements IUsecase<IDeleteUserPort, void> {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(port: IDeleteUserPort): Promise<void> {
    const user = await this.userRepository.findUserById(port.id);
    if (!user) {
      throw Exception.new({
        code: Code.ENTITY_NOT_FOUND_ERROR,
        overrideMessage: "user is not exist",
      });
    }

    const domainResult = await user.deleteUser();
    if (!domainResult) {
      throw Exception.new({
        code: Code.BAD_REQUEST_ERROR,
        overrideMessage: "user is owner of any group",
      });
    }

    const repositoryResult = await this.userRepository.updateUser(user);

    if (!repositoryResult) {
      throw Exception.new({
        code: Code.INTERNAL_ERROR,
        overrideMessage: "update user error",
      });
    }
  }
}
