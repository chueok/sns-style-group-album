import { Code } from "../../../common/exception/code";
import { Exception } from "../../../common/exception/exception";
import { IUsecase } from "../../../common/usecase/usecase.interface";
import { Group } from "../entity/group";
import { IGroupRepository } from "../repository/group-repository.interface";
import { IGetGroupPort } from "./port/get-group-port";

export class GetGroupUsecase implements IUsecase<IGetGroupPort, Group> {
  constructor(private readonly groupRepository: IGroupRepository) {}
  async execute(port: IGetGroupPort): Promise<Group> {
    const group = await this.groupRepository.findGroupById(port.groupId);
    if (!group) {
      throw Exception.new({
        code: Code.ENTITY_NOT_FOUND_ERROR,
        overrideMessage: "Group not found",
      });
    }
    return group;
  }
}
