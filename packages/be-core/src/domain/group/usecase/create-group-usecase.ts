import { Code } from "../../../common/exception/code";
import { Exception } from "../../../common/exception/exception";
import { IUsecase } from "../../../common/usecase/usecase.interface";
import { UserId } from "../../user/entity/type/user-id";
import { Group } from "../entity/group";
import { CreateGroupEntityPayload } from "../entity/type/create-group-entity-payload";
import { IGroupRepository } from "../repository/group-repository.interface";
import { ICreateGroupPort } from "./port/create-group-port";

export class CreateGroupUsecase implements IUsecase<ICreateGroupPort, Group> {
  constructor(private readonly groupRepository: IGroupRepository) {}
  async execute(port: ICreateGroupPort): Promise<Group> {
    const payload: CreateGroupEntityPayload<"new"> = {
      ownerId: port.ownerId as UserId,
      name: port.name,
    };
    const group = await Group.new(payload);

    const result = await this.groupRepository.createGroup(group);
    if (!result) {
      throw Exception.new({
        code: Code.BAD_REQUEST_ERROR,
        overrideMessage: "Failed to create group",
      });
    }
    return group;
  }
}
