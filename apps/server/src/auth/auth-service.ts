import {
  Inject,
  Injectable,
  Logger,
  LoggerService,
  Optional as OptionalInject,
} from '@nestjs/common';
import { VerifiedUserPayload } from './type/verified-user-payload';
import {
  Code,
  CreateUserEntityPayload,
  Exception,
  IUserRepository,
  Nullable,
  User,
} from '@repo/be-core';
import { JwtService } from '@nestjs/jwt';
import { DataSource, Repository } from 'typeorm';
import { TypeormOauth } from '../infrastructure/persistence/typeorm/entity/oauth/typeorm-oauth.entity';
import { OauthUserPayload } from './type/oauth-user-payload';
import { RestResponseJwt } from '../http-rest/controller/dto/auth/rest-response-jwt';
import { RestResponseSignupJwt } from '../http-rest/controller/dto/auth/rest-response-signup-jwt';
import { DiTokens } from '../di/di-tokens';
import { TypeormUser } from '../infrastructure/persistence/typeorm/entity/user/typeorm-user.entity';
import { TypeormGroup } from '../infrastructure/persistence/typeorm/entity/group/typeorm-group.entity';
import { plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';
import { JwtSignupModel, JwtSignupPayload } from './type/jwt-signup-payload';
import { ISignupPort } from './port/signup-port';
import { TypeormContent } from '../infrastructure/persistence/typeorm/entity/content/typeorm-content.entity';
import { TypeormComment } from '../infrastructure/persistence/typeorm/entity/comment/typeorm-comment.entity';
import { JwtUserModel, JwtUserPayload } from './type/jwt-user-payload';

@Injectable()
export class AuthService {
  private readonly typeormUserRepository: Repository<TypeormUser>;
  private readonly typeormOauthRepository: Repository<TypeormOauth>;
  private readonly typeormGroupRepository: Repository<TypeormGroup>;
  private readonly typeormContentRepository: Repository<TypeormContent>;
  private readonly typeormCommentRepository: Repository<TypeormComment>;

  private readonly logger: LoggerService;

  constructor(
    @Inject(DiTokens.UserRepository)
    private readonly userRepository: IUserRepository,
    private readonly jwtService: JwtService,
    readonly dataSource: DataSource,
    @OptionalInject() logger?: LoggerService
  ) {
    this.typeormOauthRepository = dataSource.getRepository(TypeormOauth);
    this.typeormUserRepository = dataSource.getRepository(TypeormUser);
    this.typeormGroupRepository = dataSource.getRepository(TypeormGroup);
    this.typeormContentRepository = dataSource.getRepository(TypeormContent);
    this.typeormCommentRepository = dataSource.getRepository(TypeormComment);

    this.logger = logger || new Logger(AuthService.name);
  }

  /**
   * 유저 정보를 통해 로그인 토큰을 발급
   */
  async getLoginToken(user: VerifiedUserPayload): Promise<RestResponseJwt> {
    return {
      accessToken: this.jwtService.sign(user),
    };
  }

  /**
   * 회원가입 토큰을 발급
   */
  async getSignupToken(user: OauthUserPayload): Promise<RestResponseSignupJwt> {
    const signupPayload: JwtSignupPayload = {
      ...user,
      createdTimestamp: Date.now(),
    };

    const signupToken = this.jwtService.sign(signupPayload, {
      expiresIn: '30m',
    });

    const oauth = new TypeormOauth();
    oauth.provider = user.provider;
    oauth.providerId = user.providerId;
    oauth.secretToken = signupToken;
    oauth.email = user.email || null;
    oauth.createdDateTime = new Date();
    await this.typeormOauthRepository.save(oauth);

    return {
      signupToken,
    };
  }

  async signup(payload: ISignupPort): Promise<RestResponseJwt> {
    const signupPayload = await this.validateSignupToken(payload.signupToken);

    const oauth = await this.typeormOauthRepository.findOneBy({
      provider: signupPayload.provider,
      providerId: signupPayload.providerId,
      secretToken: payload.signupToken,
      userId: undefined,
    });
    if (!oauth) {
      throw Exception.new({
        code: Code.UNAUTHORIZED_ERROR,
      });
    }

    // NOTE : 현재는 signup 시에는 profile image등록이 불가 함.
    // 필요시 변경 필요
    const newUserPayload: CreateUserEntityPayload<'new'> = {
      username: payload.username,
      email: payload.email,
    };

    const newUser = await User.new(newUserPayload);
    const result = await this.userRepository.createUser(newUser);
    if (!result) {
      this.logger.log(`createUser failed: ${newUserPayload}`);
      throw Exception.new({
        code: Code.BAD_REQUEST_ERROR,
        overrideMessage: 'create user failed',
      });
    }

    return this.getLoginToken({ id: newUser.id });
  }

  /**
   * provider와 providerId로 회원 정보를 조회
   */
  async getOauthUser(
    provider: string,
    providerId: string
  ): Promise<Nullable<VerifiedUserPayload>> {
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
    const userPayload: VerifiedUserPayload = {
      id: user.id,
    };
    return userPayload;
  }

  async getUser(payload: { id: string }): Promise<VerifiedUserPayload> {
    const user = await this.typeormUserRepository
      .createQueryBuilder('user')
      .where('user.id = :id', { id: payload.id })
      .andWhere('user.deletedDateTime is null')
      .getOne();

    if (!user) {
      throw Exception.new({ code: Code.UNAUTHORIZED_ERROR });
    }
    const userPayload: VerifiedUserPayload = {
      id: user.id,
    };
    return userPayload;
  }

  async getGroupMember(payload: {
    userId: string;
    groupId: string;
  }): Promise<VerifiedUserPayload> {
    const { userId, groupId } = payload;

    const [user, isGroupMember] = await Promise.all([
      this.getUser({ id: userId }),

      this.typeormUserRepository
        .createQueryBuilder('user')
        .leftJoinAndSelect('user.groups', 'group')
        .where('user.id = :userId', { userId })
        .andWhere('group.id = :groupId', { groupId })
        .getCount()
        .then((count) => count > 0),
    ]);

    if (!isGroupMember) {
      throw Exception.new({
        code: Code.ACCESS_DENIED_ERROR,
      });
    }

    return user;
  }

  async getGroupOwner(payload: {
    userId: string;
    groupId: string;
  }): Promise<VerifiedUserPayload> {
    const { userId, groupId } = payload;

    const [user, isGroupOwner] = await Promise.all([
      this.getUser({ id: userId }),

      this.typeormGroupRepository
        .createQueryBuilder('group')
        .where('group.id = :groupId', { groupId })
        .andWhere('group.ownerId = :userId', { userId })
        .getCount()
        .then((count) => count > 0),
    ]);

    if (!isGroupOwner) {
      throw Exception.new({
        code: Code.ACCESS_DENIED_ERROR,
      });
    }

    return user;
  }

  async getContentOwner(payload: {
    userId: string;
    groupId: string;
    contentId: string;
  }): Promise<VerifiedUserPayload> {
    const { userId, groupId, contentId } = payload;

    const [groupMember, isContentOwner] = await Promise.all([
      this.getGroupMember({ userId, groupId }),
      this.typeormContentRepository
        .createQueryBuilder('content')
        .where('content.id = :contentId', { contentId })
        .andWhere('content.ownerId = :userId', { userId })
        .getCount()
        .then((count) => count > 0),
    ]);

    if (!isContentOwner) {
      throw Exception.new({
        code: Code.ACCESS_DENIED_ERROR,
      });
    }

    return groupMember;
  }

  async getCommentOwner(payload: {
    userId: string;
    groupId: string;
    commentId: string;
  }): Promise<VerifiedUserPayload> {
    const { userId, groupId, commentId } = payload;

    const [groupMember, isCommentOwner] = await Promise.all([
      this.getGroupMember({ userId, groupId }),

      await this.typeormCommentRepository
        .createQueryBuilder('comment')
        .where('comment.id = :commentId', { commentId })
        .andWhere('comment.ownerId = :userId', { userId })
        .getCount()
        .then((count) => count > 0),
    ]);

    if (!isCommentOwner) {
      throw Exception.new({
        code: Code.ACCESS_DENIED_ERROR,
      });
    }

    return groupMember;
  }

  private async validateSignupToken(jwt: string): Promise<JwtSignupPayload> {
    let jwtPayload: JwtSignupPayload;
    try {
      jwtPayload = this.jwtService.verify(jwt);
    } catch (error) {
      throw Exception.new({
        code: Code.UNAUTHORIZED_ERROR,
      });
    }

    const signupModel = plainToInstance(JwtSignupModel, jwtPayload);

    const errors = validateSync(signupModel);
    if (errors.length > 0) {
      throw Exception.new({
        code: Code.UNAUTHORIZED_ERROR,
      });
    }

    return signupModel.toObject();
  }

  validateLoginToken(token: string): JwtUserPayload {
    let jwtPayload: JwtUserPayload;
    try {
      jwtPayload = this.jwtService.verify(token);
    } catch (error) {
      throw Exception.new({
        code: Code.UNAUTHORIZED_ERROR,
      });
    }

    const jwtUserModel = plainToInstance(JwtUserModel, jwtPayload);
    const errors = validateSync(jwtUserModel);
    if (errors.length > 0) {
      throw Exception.new({
        code: Code.UNAUTHORIZED_ERROR,
      });
    }

    return jwtPayload;
  }
}
