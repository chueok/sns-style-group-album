import { Code } from '../../common/exception/code';
import { Exception } from '../../common/exception/exception';
import { TUser } from './entity/user';
import { IUserRepository } from './user-repository.interface';

export class UserService {
  constructor(private readonly userRepository: IUserRepository) {}

  /**
   * 유저 정보를 가져오는 두가지 방법에 대해 고민하였음
   * 1. cookie 정보를 통해 유저 정보 리턴
   *   - 유저 정보가 변경되었을 때 최신 데이터 반영 불가함
   *   - 최신 데이터 반영을 위해 cookie를 재생성 한다면, 어쨋든 db를 조회하여야 함.
   * 2. 매 요청마다 db 조회하여 리턴
   *   - 1번 방법의 단점으로 2번을 선택하였으며,
   *     client 측 cache를 통해 자주 조회하지 않도록 구현 할 것.
   */
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

  async editDefaultProfile(payload: {
    userId: string;
    username?: string;
  }): Promise<TUser> {
    const { userId, username } = payload;

    const changes: Partial<{
      username: string;
      profileImageUrl: string | null;
    }> = {};
    if (username) {
      changes.username = username;
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

  async generateProfileImageUploadUrl(payload: {
    requesterId: string;
  }): Promise<string> {
    const { requesterId } = payload;
    const url =
      await this.userRepository.createProfileImageUploadUrl(requesterId);
    return url;
  }

  async deleteProfileImage(payload: { requesterId: string }): Promise<void> {
    const { requesterId } = payload;
    await this.userRepository.deleteProfileImage(requesterId);
  }
}
