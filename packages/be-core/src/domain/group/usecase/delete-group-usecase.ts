import { Code, Exception, IDeleteGroupPort, IGroupRepository } from "../../..";
import { IUsecase } from "../../../common/usecase/usecase.interface";

export class DeleteGroupUsecase implements IUsecase<IDeleteGroupPort, void> {
  constructor(private readonly groupRepository: IGroupRepository) {}

  async execute(port: IDeleteGroupPort): Promise<void> {
    const group = await this.groupRepository.findGroupById(port.groupId);
    if (!group) {
      throw Exception.new({
        code: Code.ENTITY_NOT_FOUND_ERROR,
        overrideMessage: "Group not found",
      });
    }

    const result = await group.deleteGroup();
    if (!result) {
      throw Exception.new({
        code: Code.BAD_REQUEST_ERROR,
        overrideMessage: "Group has members",
      });
    }

    const repositoryResult = await this.groupRepository.updateGroup(group);
    if (!repositoryResult) {
      throw Exception.new({
        code: Code.INTERNAL_ERROR,
        overrideMessage: "Failed to delete group",
      });
    }
  }
}
