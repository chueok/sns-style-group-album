import { Code } from '../../../common/exception/code';
import { Exception } from '../../../common/exception/exception';
import { IUsecase } from '../../../common/usecase/usecase.interface';
import { Group } from '../entity/group';
import { IGroupRepository } from '../repository/group-repository.interface';
import { IGetGroupListPort } from './port/get-group-list-port';

export class GetGroupListUsecase
  implements IUsecase<IGetGroupListPort, Group[]>
{
  constructor(private readonly groupRepository: IGroupRepository) {}

  async execute(port: IGetGroupListPort): Promise<Group[]> {
    const groupList = await this.groupRepository.findGroupListByUserId(
      port.userId
    );
    if (groupList.length === 0) {
      throw Exception.new({
        code: Code.ENTITY_NOT_FOUND_ERROR,
        overrideMessage: 'Group not found',
      });
    }

    return groupList;
  }
}
