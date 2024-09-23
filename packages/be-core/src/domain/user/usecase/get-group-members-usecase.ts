import { IUsecase } from "../../../common/usecase/usecase.interface";
import { IUserRepository } from "../repository/user-repository.interface";
import { UserUsecaseDto } from "./dto/user-dto";
import { UserSimpleUsecaseDto } from "./dto/user-simple-dto";
import { IGetGroupMembersPort } from "./port/get-group-members-port";

export class GetGroupMembersUsecase
  implements IUsecase<IGetGroupMembersPort, UserSimpleUsecaseDto[]>
{
  constructor(private readonly userRepository: IUserRepository) {}
  async execute(port: IGetGroupMembersPort): Promise<UserUsecaseDto[]> {
    const userList = await this.userRepository.findUserListByGroupId(
      port.groupId,
    );
    return userList.map((user) => UserUsecaseDto.newFromUser(user));
  }
}
