import {
  Code,
  Exception,
  Group,
  IGroupRepository,
  IInviteUserPort,
  UserId,
} from '../../..';
import { IUsecase } from '../../../common/usecase/usecase.interface';

export class InviteUserUsecase implements IUsecase<IInviteUserPort, Group> {
  constructor(private readonly groupRepository: IGroupRepository) {}
  async execute(port: IInviteUserPort): Promise<Group> {
    const group = await this.groupRepository.findGroupById(port.groupId);
    if (!group) {
      throw Exception.new({
        code: Code.ENTITY_NOT_FOUND_ERROR,
        overrideMessage: 'Group not found',
      });
    }

    const domainResult = await group.inviteUsers(
      port.invitedUserList as UserId[]
    );
    if (!domainResult) {
      throw Exception.new({
        code: Code.BAD_REQUEST_ERROR,
        overrideMessage: 'Failed to invite user',
      });
    }

    const repositoryResult = await this.groupRepository.updateGroup(group);
    if (!repositoryResult) {
      throw Exception.new({
        code: Code.INTERNAL_ERROR,
        overrideMessage: 'Failed to invite user',
      });
    }

    return group;
  }
}
