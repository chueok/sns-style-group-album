import {
  Inject,
  Injectable,
  Logger,
  LoggerService,
  Optional as OptionalInject,
} from "@nestjs/common";
import { HttpUserPayload } from "./type/http-user";
import {
  CreateUserEntityPayload,
  IUserRepository,
  Nullable,
  User,
  UserId,
} from "@repo/be-core";
import { JwtService } from "@nestjs/jwt";
import { DataSource, Repository } from "typeorm";
import { TypeormOauth } from "../../infrastructure/persistence/typeorm/entity/oauth/typeorm-oauth.entity";
import { HttpOauthUserPayload } from "./type/http-oauth-user";
import { RestResponseJwt } from "../controller/documentation/auth/rest-response-jwt";
import { RestResponseSignupJwt } from "../controller/documentation/auth/rest-response-signup-jwt";
import { DiTokens } from "../../di/di-tokens";
import { TypeormUser } from "../../infrastructure/persistence/typeorm/entity/user/typeorm-user.entity";
import { TypeormGroup } from "../../infrastructure/persistence/typeorm/entity/group/typeorm-group.entity";

@Injectable()
export class HttpAuthService {
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

    this.logger = logger || new Logger(HttpAuthService.name);
  }

  async getOauthUser(
    provider: string,
    providerId: string,
  ): Promise<Nullable<HttpUserPayload>> {
    const user = await this.userRepository.findUserByOauth({
      provider,
      providerId,
    });
    if (!user) {
      return null;
    }
    const userPayload: HttpUserPayload = {
      id: user.id,
      username: user.username,
      thumbnailRelativePath: user.thumbnailRelativePath,
    };
    return userPayload;
  }

  async getLoginToken(user: HttpUserPayload): Promise<RestResponseJwt> {
    return {
      accessToken: this.jwtService.sign(user),
    };
  }

  async getSignupToken(
    user: HttpOauthUserPayload,
  ): Promise<RestResponseSignupJwt> {
    const signupToken = this.jwtService.sign(user, {
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

  async signup(payload: {
    signupToken: string;
    provider: string;
    providerId: string;
    username: string;
    thumbnailRelativePath: Nullable<string>;
    email: string;
  }): Promise<Nullable<HttpUserPayload>> {
    const oauth = await this.typeormOauthRepository.findOneBy({
      provider: payload.provider,
      providerId: payload.providerId,
      secretToken: payload.signupToken,
      userId: undefined,
    });

    if (!oauth) {
      this.logger.log(`oauth not found: ${payload}`);
      return null;
    }

    const newUserPayload: CreateUserEntityPayload<"new"> = {
      username: payload.username,
      email: payload.email,
      thumbnailRelativePath: payload.thumbnailRelativePath,
    };
    const newUser = await User.new(newUserPayload);
    const result = await this.userRepository.createUser(newUser);
    if (!result) {
      this.logger.log(`createUser failed: ${newUserPayload}`);
      return null;
    }
    return {
      id: newUser.id,
      username: newUser.username,
      thumbnailRelativePath: newUser.thumbnailRelativePath,
    };
  }

  async getUser(payload: { id: string }): Promise<Nullable<HttpUserPayload>> {
    const user = await this.userRepository.findUserById(payload.id as UserId);
    if (!user) {
      this.logger.log(`user not found: ${payload}`);
      return null;
    }
    const userPayload: HttpUserPayload = {
      id: user.id,
      username: user.username,
      thumbnailRelativePath: user.thumbnailRelativePath,
    };
    return userPayload;
  }

  async isUserInGroup(userId: string, groupId: string): Promise<boolean> {
    const isInGroup =
      (await this.typeormUserRepository
        .createQueryBuilder("user")
        .innerJoinAndSelect("user.groups", "group")
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
}
