import { Injectable } from '@nestjs/common';
import { Nullable, UserId } from '@repo/be-core';
import { DataSource, Repository } from 'typeorm';
import { TypeormOauth } from '../infrastructure/persistence/typeorm/entity/oauth/typeorm-oauth.entity';
import { TypeormUser } from '../infrastructure/persistence/typeorm/entity/user/typeorm-user.entity';
import { IAuthRepository } from './auth-repository.interface';
import { v4 } from 'uuid';
import { Transactional } from 'typeorm-transactional';
import { TJwtUser } from './type/jwt-user';

@Injectable()
export class AuthRepository implements IAuthRepository {
  private readonly typeormUserRepository: Repository<TypeormUser>;
  private readonly typeormOauthRepository: Repository<TypeormOauth>;

  constructor(readonly dataSource: DataSource) {
    this.typeormOauthRepository = dataSource.getRepository(TypeormOauth);
    this.typeormUserRepository = dataSource.getRepository(TypeormUser);
  }

  @Transactional()
  async createUser(payload: {
    provider: string;
    providerId: string;
    profileUrl?: string;
    email?: string;
  }): Promise<TJwtUser> {
    const createdDateTime = new Date();

    const newUser = this.typeormUserRepository.create({
      username: payload.email,
      email: payload.email,
      profileUrl: payload.profileUrl,
      createdDateTime,
    });
    newUser.id = v4() as UserId; // TODO: userId 생성 함수를 만들 것.

    const oauth = this.typeormOauthRepository.create({
      provider: payload.provider,
      providerId: payload.providerId,
      userId: newUser.id,
      createdDateTime,
    });

    await this.typeormUserRepository.save(newUser);
    await this.typeormOauthRepository.save(oauth);

    return { id: newUser.id };
  }

  /**
   * provider와 providerId로 회원 정보를 조회
   */
  async getOauthUser(
    provider: string,
    providerId: string
  ): Promise<Nullable<TJwtUser>> {
    const user = await this.typeormUserRepository
      .createQueryBuilder('user')
      .andWhere('user.deletedDateTime is null')
      .innerJoinAndSelect('user.oauths', 'oauth')
      .where('oauth.provider = :provider', { provider })
      .where('oauth.providerId = :providerId', { providerId })
      .getOne();
    if (!user) {
      return null;
    }
    const userPayload: TJwtUser = {
      id: user.id,
    };
    return userPayload;
  }

  // async getUser(payload: { id: string }): Promise<TJwtUser> {
  //   const user = await this.typeormUserRepository
  //     .createQueryBuilder('user')
  //     .where('user.id = :id', { id: payload.id })
  //     .andWhere('user.deletedDateTime is null')
  //     .getOne();

  //   if (!user) {
  //     throw Exception.new({ code: Code.UNAUTHORIZED_ERROR });
  //   }
  //   const userPayload: TJwtUser = {
  //     id: user.id,
  //   };
  //   return userPayload;
  // }

  // async getGroupMember(payload: {
  //   userId: string;
  //   groupId: string;
  // }): Promise<TJwtUser> {
  //   const { userId, groupId } = payload;

  //   const [user, isGroupMember] = await Promise.all([
  //     this.getUser({ id: userId }),

  //     this.typeormUserRepository
  //       .createQueryBuilder('user')
  //       .leftJoinAndSelect('user.groups', 'group')
  //       .where('user.id = :userId', { userId })
  //       .andWhere('group.id = :groupId', { groupId })
  //       .getCount()
  //       .then((count) => count > 0),
  //   ]);

  //   if (!isGroupMember) {
  //     throw Exception.new({
  //       code: Code.ACCESS_DENIED_ERROR,
  //     });
  //   }

  //   return user;
  // }

  // async getGroupOwner(payload: {
  //   userId: string;
  //   groupId: string;
  // }): Promise<TJwtUser> {
  //   const { userId, groupId } = payload;

  //   const [user, isGroupOwner] = await Promise.all([
  //     this.getUser({ id: userId }),

  //     this.typeormGroupRepository
  //       .createQueryBuilder('group')
  //       .where('group.id = :groupId', { groupId })
  //       .andWhere('group.ownerId = :userId', { userId })
  //       .getCount()
  //       .then((count) => count > 0),
  //   ]);

  //   if (!isGroupOwner) {
  //     throw Exception.new({
  //       code: Code.ACCESS_DENIED_ERROR,
  //     });
  //   }

  //   return user;
  // }

  // async getContentOwner(payload: {
  //   userId: string;
  //   groupId: string;
  //   contentId: string;
  // }): Promise<TJwtUser> {
  //   const { userId, groupId, contentId } = payload;

  //   const [groupMember, isContentOwner] = await Promise.all([
  //     this.getGroupMember({ userId, groupId }),
  //     this.typeormContentRepository
  //       .createQueryBuilder('content')
  //       .where('content.id = :contentId', { contentId })
  //       .andWhere('content.ownerId = :userId', { userId })
  //       .getCount()
  //       .then((count) => count > 0),
  //   ]);

  //   if (!isContentOwner) {
  //     throw Exception.new({
  //       code: Code.ACCESS_DENIED_ERROR,
  //     });
  //   }

  //   return groupMember;
  // }

  // async getCommentOwner(payload: {
  //   userId: string;
  //   groupId: string;
  //   commentId: string;
  // }): Promise<TJwtUser> {
  //   const { userId, groupId, commentId } = payload;

  //   const [groupMember, isCommentOwner] = await Promise.all([
  //     this.getGroupMember({ userId, groupId }),

  //     await this.typeormCommentRepository
  //       .createQueryBuilder('comment')
  //       .where('comment.id = :commentId', { commentId })
  //       .andWhere('comment.ownerId = :userId', { userId })
  //       .getCount()
  //       .then((count) => count > 0),
  //   ]);

  //   if (!isCommentOwner) {
  //     throw Exception.new({
  //       code: Code.ACCESS_DENIED_ERROR,
  //     });
  //   }

  //   return groupMember;
  // }
}
