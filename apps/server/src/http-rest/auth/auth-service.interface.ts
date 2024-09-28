import { HttpUserPayload } from "./type/http-user";
import { HttpOauthUserPayload } from "./type/http-oauth-user";
import { RestResponseJwt } from "../controller/dto/auth/rest-response-jwt";
import { RestResponseSignupJwt } from "../controller/dto/auth/rest-response-signup-jwt";
import { Nullable } from "@repo/be-core";

export interface IAuthService {
  getLoginToken(user: HttpUserPayload): Promise<RestResponseJwt>;

  getSignupToken(user: HttpOauthUserPayload): Promise<RestResponseSignupJwt>;

  signup(payload: {
    signupToken: string;
    username: string;
    email: string;
  }): Promise<RestResponseJwt>;

  // for oauth
  getOauthUser(
    provider: string,
    providerId: string,
  ): Promise<Nullable<HttpUserPayload>>;

  getUser(payload: { id: string }): Promise<Nullable<HttpUserPayload>>;

  isUserInGroup(userId: string, groupId: string): Promise<boolean>;

  isGroupOwner(userId: string, groupId: string): Promise<boolean>;
}
