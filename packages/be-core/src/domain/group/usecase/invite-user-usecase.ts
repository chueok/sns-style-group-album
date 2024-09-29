import {
  Code,
  Exception,
  Group,
  IGroupRepository,
  IInviteUserPort,
  UserId,
} from "../../..";
import { IUsecase } from "../../../common/usecase/usecase.interface";

export class InviteUserUsecase implements IUsecase<IInviteUserPort, Group> {
  constructor(private readonly groupRepository: IGroupRepository) {}
  async execute(port: IInviteUserPort): Promise<Group> {
    const group = await this.groupRepository.findGroupById(port.groupId);
    if (!group) {
      throw Exception.new({
        code: Code.ENTITY_NOT_FOUND_ERROR,
        overrideMessage: "Group not found",
      });
    }

    await group.inviteUsers(port.invitedUserList as UserId[]);
    const result = await this.groupRepository.updateGroup(group);
    if (!result) {
      throw Exception.new({
        code: Code.INTERNAL_ERROR,
        overrideMessage: "Failed to invite user",
      });
    }

    return group;
  }
}
