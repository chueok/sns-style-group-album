import { Code } from '../../common/exception/code';
import { Exception } from '../../common/exception/exception';
import { TUser } from './entity/user';
import { IUserRepository } from './user-repository.interface';

export class UserService {
  constructor(private readonly userRepository: IUserRepository) {}

  async getUser(id: string): Promise<TUser> {
    try {
      const user = await this.userRepository.findUserById(id);
      if (!user) {
        throw Exception.new({
          code: Code.ENTITY_NOT_FOUND_ERROR,
          overrideMessage: 'User not found',
        });
      }
      return user;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async deleteUser(id: string): Promise<void> {
    const user = await this.userRepository.findUserById(id);
    if (!user) {
      throw Exception.new({
        code: Code.ENTITY_NOT_FOUND_ERROR,
        overrideMessage: 'user is not exist',
      });
    }

    await this.userRepository.deleteUser(id);
  }

  async editGroupProfile(payload: {
    userId: string;
    groupId: string;
    username?: string;
    profileImageUrl?: string;
  }): Promise<TUser> {
    const { userId, groupId, username, profileImageUrl } = payload;

    const isUserInGroup = await this.userRepository.isUserInGroup(
      userId,
      groupId
    );
    if (!isUserInGroup) {
      throw Exception.new({
        code: Code.UNAUTHORIZED_ERROR,
        overrideMessage: 'User is not in group',
      });
    }

    const result = await this.userRepository.updateGroupProfile({
      userId,
      groupId,
      username,
      profileImageUrl,
    });

    return result;
  }

  async editDefaultProfile(payload: {
    userId: string;
    username?: string;
    profileImageUrl?: string;
  }): Promise<TUser> {
    const { userId, username, profileImageUrl } = payload;

    const changes: Partial<{
      username: string;
      profileImageUrl: string | null;
    }> = {};
    if (username) {
      changes.username = username;
    }
    if (profileImageUrl) {
      changes.profileImageUrl = profileImageUrl;
    }
    if (Object.keys(changes).length === 0) {
      throw Exception.new({
        code: Code.BAD_REQUEST_ERROR,
        overrideMessage: 'No changes to update',
      });
    }

    const result = await this.userRepository.updateUser(userId, changes);
    if (!result) {
      throw Exception.new({
        code: Code.INTERNAL_ERROR,
        overrideMessage: 'Failed to update user',
      });
    }

    const user = await this.userRepository.findUserById(userId);
    if (!user) {
      throw Exception.new({
        code: Code.ENTITY_NOT_FOUND_ERROR,
        overrideMessage: 'User not found',
      });
    }

    return user;
  }
}
