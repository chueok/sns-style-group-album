import { Injectable } from "@nestjs/common";
import { HttpUserPayload } from "./type/http-user";
import { Nullable, Optional, UserId } from "@repo/be-core";
import { TypeormUserRepository } from "../../infrastructure/persistence/typeorm/repository/user/user-repository";
import { JwtService } from "@nestjs/jwt";
import { HttpOauthUserPayloadValidator } from "./type/http-oauth-user";
import { instanceToPlain } from "class-transformer";

@Injectable()
export class HttpAuthService {
  constructor(
    private readonly userRepository: TypeormUserRepository,
    private readonly jwtService: JwtService,
  ) {}

  async getOauthUser(
    provider: string,
    providerId: string,
  ): Promise<Nullable<HttpUserPayload>> {
    return null;
  }

  async login(user: HttpUserPayload) {
    return {
      access_token: this.jwtService.sign(user),
    };
  }

  async signup(user: HttpOauthUserPayloadValidator) {
    const obj = instanceToPlain(user);
    return {
      access_token: this.jwtService.sign(obj, { expiresIn: "30m" }),
    };
  }

  async getUser(payload: { id: string }): Promise<Optional<HttpUserPayload>> {
    const user = await this.userRepository.findUserById(payload.id as UserId);
    if (!user) {
      return undefined;
    }
    const userPayload: HttpUserPayload = {
      id: user.id,
      username: user.username,
      thumbnailRelativePath: user.thumbnailRelativePath || undefined,
    };
    return userPayload;
  }
}
