import { Code } from '../../../common/exception/code';
import { Exception } from '../../../common/exception/exception';
import { IUsecase } from '../../../common/usecase/usecase.interface';
import { Group } from '../entity/group';
import { IGroupRepository } from '../repository/group-repository.interface';
import { IGetOwnGroupListPort } from './port/get-own-group-list-port';

export class GetOwnGroupListUsecase
  implements IUsecase<IGetOwnGroupListPort, Group[]>
{
  constructor(private readonly groupRepository: IGroupRepository) {}

  async execute(adapter: IGetOwnGroupListPort): Promise<Group[]> {
    const ownGroupList = await this.groupRepository.findGroupListByOwnerId(
      adapter.userId
    );
    if (ownGroupList.length === 0) {
      throw Exception.new({
        code: Code.ENTITY_NOT_FOUND_ERROR,
        overrideMessage: 'Own group list not found',
      });
    }

    return ownGroupList.filter((group) => group.ownerId === adapter.userId);
  }
}
