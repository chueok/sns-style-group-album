import { Injectable } from '@nestjs/common';
import { Code, Exception, Nullable, UserId } from '@repo/be-core';
import { DataSource, Repository } from 'typeorm';
import { TypeormOauth } from '../infrastructure/persistence/typeorm/entity/oauth/typeorm-oauth.entity';
import { TypeormUser } from '../infrastructure/persistence/typeorm/entity/user/typeorm-user.entity';
import { IAuthRepository } from './auth-repository.interface';
import { v4 } from 'uuid';
import { Transactional } from 'typeorm-transactional';
import { TJwtUser } from './type/jwt-user';
import { TypeormRefreshToken } from '../infrastructure/persistence/typeorm/entity/refresh-token/typeorm-refresh-token.entity';

@Injectable()
export class AuthRepository implements IAuthRepository {
  private readonly typeormUserRepository: Repository<TypeormUser>;
  private readonly typeormOauthRepository: Repository<TypeormOauth>;
  private readonly typeormRefreshTokenRepository: Repository<TypeormRefreshToken>;

  constructor(readonly dataSource: DataSource) {
    this.typeormOauthRepository = dataSource.getRepository(TypeormOauth);
    this.typeormUserRepository = dataSource.getRepository(TypeormUser);
    this.typeormRefreshTokenRepository =
      dataSource.getRepository(TypeormRefreshToken);
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
      email: payload.email,
      profileImageUrl: payload.profileUrl,
      createdDateTime,
    });
    newUser.id = v4() as UserId;

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

  async saveRefreshToken(userId: string, refreshToken: string): Promise<void> {
    // 새로운 refresh token 저장
    const createdDateTime = new Date();

    const newRefreshToken = this.typeormRefreshTokenRepository.create({
      userId,
      token: refreshToken,
      createdDateTime,
    });

    await this.typeormRefreshTokenRepository.save(newRefreshToken);
  }

  async clearRefreshToken(userId: string): Promise<void> {
    await this.typeormRefreshTokenRepository.delete({
      userId: userId as UserId,
    });
  }

  async validateRefreshToken(
    userId: string,
    refreshToken: string
  ): Promise<boolean> {
    const token = await this.typeormRefreshTokenRepository.findOne({
      where: { userId: userId as UserId, token: refreshToken },
    });

    return !!token;
  }

  async getUser(userId: string): Promise<TJwtUser> {
    const user = await this.typeormUserRepository
      .createQueryBuilder('user')
      .where('user.id = :id', { id: userId })
      .andWhere('user.deletedDateTime is null')
      .getOne();

    if (!user) {
      throw Exception.new({ code: Code.UNAUTHORIZED_ERROR });
    }
    const userPayload: TJwtUser = {
      id: user.id,
    };
    return userPayload;
  }
}
