import {
  Injectable,
  Logger,
  LoggerService,
  Optional as OptionalInject,
} from "@nestjs/common";
import { HttpUserPayload } from "./type/http-user";
import { CreateUserEntityPayload, Nullable, User, UserId } from "@repo/be-core";
import { TypeormUserRepository } from "../../infrastructure/persistence/typeorm/repository/user/user-repository";
import { JwtService } from "@nestjs/jwt";
import { DataSource, Repository } from "typeorm";
import { TypeormOauth } from "../../infrastructure/persistence/typeorm/entity/oauth/typeorm-oauth.entity";
import { HttpOauthUserPayload } from "./type/http-oauth-user";
import { RestResponseJwt } from "../controller/documentation/auth/rest-response-jwt";
import { RestResponseSignupJwt } from "../controller/documentation/auth/rest-response-signup-jwt";

@Injectable()
export class HttpAuthService {
  private readonly oauthRepository: Repository<TypeormOauth>;

  private readonly logger: LoggerService;

  constructor(
    private readonly userRepository: TypeormUserRepository,
    private readonly jwtService: JwtService,
    readonly dataSource: DataSource,
    @OptionalInject() logger?: LoggerService,
  ) {
    this.oauthRepository = dataSource.getRepository(TypeormOauth);

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
    await this.oauthRepository.save(oauth);

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
    const oauth = await this.oauthRepository.findOneBy({
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
}
