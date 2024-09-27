import { IUsecase } from "../../../common/usecase/usecase.interface";
import { User } from "../entity/user";
import { IUserRepository } from "../repository/user-repository.interface";
import { IGetGroupMembersPort } from "./port/get-group-members-port";

export class GetGroupMembersUsecase
  implements IUsecase<IGetGroupMembersPort, User[]>
{
  constructor(private readonly userRepository: IUserRepository) {}
  async execute(port: IGetGroupMembersPort): Promise<User[]> {
    const userList = await this.userRepository.findUserListByGroupId(
      port.groupId,
    );
    return userList;
  }
}
