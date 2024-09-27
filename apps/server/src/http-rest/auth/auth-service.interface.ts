import { HttpUserPayload } from "./type/http-user";
import { HttpOauthUserPayload } from "./type/http-oauth-user";
import { RestResponseJwt } from "../controller/dto/auth/rest-response-jwt";
import { RestResponseSignupJwt } from "../controller/dto/auth/rest-response-signup-jwt";
import { HttpJwtSignupPayload } from "./type/http-jwt";
import { Nullable } from "@repo/be-core";

export interface IAuthService {
  getOauthUser(
    provider: string,
    providerId: string,
  ): Promise<Nullable<HttpUserPayload>>;

  getLoginToken(user: HttpUserPayload): Promise<RestResponseJwt>;

  getSignupToken(user: HttpOauthUserPayload): Promise<RestResponseSignupJwt>;

  validateSignupToken(jwt: string): Promise<Nullable<HttpJwtSignupPayload>>;

  signup(payload: {
    signupToken: string;
    provider: string;
    providerId: string;
    username: string;
    thumbnailRelativePath: Nullable<string>;
    email: string;
  }): Promise<Nullable<HttpUserPayload>>;

  getUser(payload: { id: string }): Promise<Nullable<HttpUserPayload>>;

  isUserInGroup(userId: string, groupId: string): Promise<boolean>;

  isGroupOwner(userId: string, groupId: string): Promise<boolean>;
}
