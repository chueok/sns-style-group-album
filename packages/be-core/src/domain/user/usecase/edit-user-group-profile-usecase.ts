import { Code } from '../../../common/exception/code';
import { Exception } from '../../../common/exception/exception';
import { IUsecase } from '../../../common/usecase/usecase.interface';
import { GroupId } from '../../group/entity/type/group-id';
import { User } from '../entity/user';
import { IUserRepository } from '../repository/user-repository.interface';
import { IEditUserGroupProfilePort } from './port/edit-user-group-profile-port';

export class EditUserGroupProfileUsecase
  implements IUsecase<IEditUserGroupProfilePort, User>
{
  constructor(private readonly userRepository: IUserRepository) {}
  async execute(port: IEditUserGroupProfilePort): Promise<User> {
    const user = await this.userRepository.findUserById(port.userId);
    if (!user) {
      throw Exception.new({
        code: Code.ENTITY_NOT_FOUND_ERROR,
        overrideMessage: 'User not found',
      });
    }

    await user.changeUserGroupProfile({
      groupId: port.groupId as GroupId,
      nickname: port.nickname,
    });

    const result = await this.userRepository.updateUser(user);
    if (!result) {
      throw Exception.new({
        code: Code.INTERNAL_ERROR,
        overrideMessage: 'Failed to update user',
      });
    }

    return user;
  }
}
