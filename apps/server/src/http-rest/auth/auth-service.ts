import {
  Inject,
  Injectable,
  Logger,
  LoggerService,
  Optional as OptionalInject,
} from "@nestjs/common";
import { VerifiedUserPayload } from "./type/verified-user-payload";
import {
  Code,
  CreateUserEntityPayload,
  Exception,
  IUserRepository,
  Nullable,
  User,
  UserId,
} from "@repo/be-core";
import { JwtService } from "@nestjs/jwt";
import { DataSource, Repository } from "typeorm";
import { TypeormOauth } from "../../infrastructure/persistence/typeorm/entity/oauth/typeorm-oauth.entity";
import { OauthUserPayload } from "./type/oauth-user-payload";
import { RestResponseJwt } from "../controller/dto/auth/rest-response-jwt";
import { RestResponseSignupJwt } from "../controller/dto/auth/rest-response-signup-jwt";
import { DiTokens } from "../../di/di-tokens";
import { TypeormUser } from "../../infrastructure/persistence/typeorm/entity/user/typeorm-user.entity";
import { TypeormGroup } from "../../infrastructure/persistence/typeorm/entity/group/typeorm-group.entity";
import { plainToInstance } from "class-transformer";
import { validateSync } from "class-validator";
import { IAuthService } from "./auth-service.interface";
import { JwtSignupModel, JwtSignupPayload } from "./type/jwt-signup-payload";
import { ISignupPort } from "./port/signup-port";

@Injectable()
export class AuthService implements IAuthService {
  private readonly typeormUserRepository: Repository<TypeormUser>;
  private readonly typeormOauthRepository: Repository<TypeormOauth>;
  private readonly typeormGroupRepository: Repository<TypeormGroup>;

  private readonly logger: LoggerService;

  constructor(
    @Inject(DiTokens.UserRepository)
    private readonly userRepository: IUserRepository,
    private readonly jwtService: JwtService,
    readonly dataSource: DataSource,
    @OptionalInject() logger?: LoggerService,
  ) {
    this.typeormOauthRepository = dataSource.getRepository(TypeormOauth);
    this.typeormUserRepository = dataSource.getRepository(TypeormUser);
    this.typeormGroupRepository = dataSource.getRepository(TypeormGroup);

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
      expiresIn: "30m",
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
    if (!signupPayload) {
      throw Exception.new({
        code: Code.UNAUTHORIZED_ERROR,
        overrideMessage: "invalid signup token",
      });
    }

    // NOTE : 현재는 signup 시에는 profile image등록이 불가 함.
    // 필요시 변경 필요
    const newUserPayload: CreateUserEntityPayload<"new"> = {
      username: payload.username,
      email: payload.email,
    };

    const newUser = await User.new(newUserPayload);
    const result = await this.userRepository.createUser(newUser);
    if (!result) {
      this.logger.log(`createUser failed: ${newUserPayload}`);
      throw Exception.new({
        code: Code.BAD_REQUEST_ERROR,
        overrideMessage: "create user failed",
      });
    }

    return this.getLoginToken({ id: newUser.id });
  }

  /**
   * provider와 providerId로 회원 정보를 조회
   */
  async getOauthUser(
    provider: string,
    providerId: string,
  ): Promise<Nullable<VerifiedUserPayload>> {
    const user = await this.userRepository.findUserByOauth({
      provider,
      providerId,
    });
    if (!user) {
      return null;
    }
    const userPayload: VerifiedUserPayload = {
      id: user.id,
    };
    return userPayload;
  }

  async getUser(payload: {
    id: string;
  }): Promise<Nullable<VerifiedUserPayload>> {
    const user = await this.userRepository.findUserById(payload.id as UserId);
    if (!user) {
      this.logger.log(`user not found: ${payload}`);
      return null;
    }
    const userPayload: VerifiedUserPayload = {
      id: user.id,
    };
    return userPayload;
  }

  async isUserInGroup(userId: string, groupId: string): Promise<boolean> {
    const isInGroup =
      (await this.typeormUserRepository
        .createQueryBuilder("user")
        .leftJoinAndSelect("user.groups", "group")
        .where("user.id = :userId", { userId })
        .andWhere("user.deletedDateTime is null")
        .andWhere("group.id = :groupId", { groupId })
        .getCount()) > 0;
    return isInGroup;
  }

  async isGroupOwner(userId: string, groupId: string): Promise<boolean> {
    const isOwner =
      (await this.typeormGroupRepository
        .createQueryBuilder("group")
        .where("group.id = :groupId", { groupId })
        .andWhere("group.ownerId = :userId", { userId })
        .getCount()) > 0;
    return isOwner;
  }

  private async validateSignupToken(
    jwt: string,
  ): Promise<Nullable<JwtSignupPayload>> {
    let jwtPayload: JwtSignupPayload;
    try {
      jwtPayload = this.jwtService.verify(jwt);
    } catch (error) {
      return null;
    }

    const signupModel = plainToInstance(JwtSignupModel, jwtPayload);

    const errors = validateSync(signupModel);
    if (errors.length > 0) {
      null;
    }

    const oauth = await this.typeormOauthRepository.findOneBy({
      provider: signupModel.provider,
      providerId: signupModel.providerId,
      secretToken: jwt,
      userId: undefined,
    });
    if (!oauth) {
      return null;
    }

    return signupModel.toObject();
  }
}