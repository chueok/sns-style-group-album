import { Code } from "../../../common/exception/code";
import { Exception } from "../../../common/exception/exception";
import { IUsecase } from "../../../common/usecase/usecase.interface";
import { UserId } from "../../user/entity/type/user-id";
import { Group } from "../entity/group";
import { IGroupRepository } from "../repository/group-repository.interface";
import { IEditGroupPort } from "./port/edit-group-port";

export class EditGroupUsecase implements IUsecase<IEditGroupPort, Group> {
  constructor(private readonly groupRepository: IGroupRepository) {}

  async execute(port: IEditGroupPort): Promise<Group> {
    const group = await this.groupRepository.findGroupById(port.groupId);
    if (!group) {
      throw Exception.new({
        code: Code.ENTITY_NOT_FOUND_ERROR,
        overrideMessage: "Group not found",
      });
    }

    if (port.ownerId) {
      const result = await group.changeOwner(port.ownerId as UserId);
      if (!result) {
        throw Exception.new({
          code: Code.BAD_REQUEST_ERROR,
          overrideMessage: "Owner not found",
        });
      }
    }
    if (port.name) {
      await group.changeName(port.name);
    }

    return group;
  }
}
