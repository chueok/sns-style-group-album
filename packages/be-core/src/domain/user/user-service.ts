import { Code } from '../../common/exception/code';
import { Exception } from '../../common/exception/exception';
import { TUser } from './entity/user';
import { IUserRepository } from './user-repository.interface';
import { Injectable } from '@nestjs/common';

@Injectable()
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

  // TODO: group-service로 이전
  // async getGroupMembers(groupId: string): Promise<TUser[]> {
  //   const userList = await this.userRepository.findUsersByGroupId(groupId);
  //   return userList;
  // }

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
    username: string;
    profileImageUrl: string;
  }): Promise<TUser> {
    const { userId, username, profileImageUrl } = payload;

    const result = await this.userRepository.updateUser(userId, {
      username,
      profileImageUrl,
    });
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

  // TODO: group service로 이전
  // async acceptInvitation(userId: string, groupId: string): Promise<void> {
  //   const group = await this.groupRepository.findGroupById(groupId);
  //   if (!group) {
  //     throw Exception.new({
  //       code: Code.ENTITY_NOT_FOUND_ERROR,
  //       overrideMessage: 'Group not found',
  //     });
  //   }

  //   const domainResult = await group.acceptInvitation(userId as UserId);
  //   if (!domainResult) {
  //     throw Exception.new({
  //       code: Code.BAD_REQUEST_ERROR,
  //       overrideMessage: 'User is not invited',
  //     });
  //   }

  //   const repositoryResult = await this.groupRepository.updateGroup(group);
  //   if (!repositoryResult) {
  //     throw Exception.new({
  //       code: Code.INTERNAL_ERROR,
  //       overrideMessage: 'Failed to update group',
  //     });
  //   }
  // }
}
