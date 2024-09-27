import { Code } from "../../../common/exception/code";
import { Exception } from "../../../common/exception/exception";
import { IUsecase } from "../../../common/usecase/usecase.interface";
import { User } from "../entity/user";
import { IUserRepository } from "../repository/user-repository.interface";
import { IGetUserPort } from "./port/get-user-port";

export class GetUserUsecase implements IUsecase<IGetUserPort, User> {
  constructor(private readonly userRepository: IUserRepository) {}
  async execute(port: IGetUserPort): Promise<User> {
    const user = await this.userRepository.findUserById(port.id);
    if (!user) {
      throw Exception.new({
        code: Code.ENTITY_NOT_FOUND_ERROR,
        overrideMessage: "User not found",
      });
    }
    return user;
  }
}
