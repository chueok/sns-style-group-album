import { Code } from "../../../common/exception/code";
import { Exception } from "../../../common/exception/exception";
import { IUsecase } from "../../../common/usecase/usecase.interface";
import { User } from "../entity/user";
import { IUserRepository } from "../repository/user-repository.interface";
import { IEditUserPort } from "./port/edit-user-port";

export class EditUserUsecase implements IUsecase<IEditUserPort, User> {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(port: IEditUserPort): Promise<User> {
    const user = await this.userRepository.findUserById(port.userId);
    if (!user) {
      throw Exception.new({
        code: Code.ENTITY_NOT_FOUND_ERROR,
        overrideMessage: "User not found",
      });
    }

    if (port.username) {
      await user.changeUsername(port.username);
      const result = await this.userRepository.updateUser(user);
      if (!result) {
        throw Exception.new({
          code: Code.INTERNAL_ERROR,
          overrideMessage: "Failed to update user",
        });
      }
    }

    const repositoryResult = await this.userRepository.updateUser(user);
    if (!repositoryResult) {
      throw Exception.new({
        code: Code.INTERNAL_ERROR,
        overrideMessage: "Failed to update user",
      });
    }

    return user;
  }
}
