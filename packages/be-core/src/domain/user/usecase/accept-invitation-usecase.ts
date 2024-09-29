import { Code, Exception, IAcceptInvitationPort, UserId } from "../../..";
import { IUsecase } from "../../../common/usecase/usecase.interface";
import { IGroupRepository } from "../../group/repository/group-repository.interface";

export class AcceptInvitationUsecase
  implements IUsecase<IAcceptInvitationPort, void>
{
  constructor(private readonly groupRepository: IGroupRepository) {}

  async execute(port: IAcceptInvitationPort): Promise<void> {
    const group = await this.groupRepository.findGroupById(port.groupId);
    if (!group) {
      throw Exception.new({
        code: Code.ENTITY_NOT_FOUND_ERROR,
        overrideMessage: "Group not found",
      });
    }

    const domainResult = await group.acceptInvitation(port.userId as UserId);
    if (!domainResult) {
      throw Exception.new({
        code: Code.BAD_REQUEST_ERROR,
        overrideMessage: "User is not invited",
      });
    }
    const repositoryResult = await this.groupRepository.updateGroup(group);
    if (!repositoryResult) {
      throw Exception.new({
        code: Code.INTERNAL_ERROR,
        overrideMessage: "Failed to update group",
      });
    }
  }
}
