import { VerifiedUserPayload } from "./type/verified-user-payload";
import { OauthUserPayload } from "./type/oauth-user-payload";
import { RestResponseJwt } from "../controller/dto/auth/rest-response-jwt";
import { RestResponseSignupJwt } from "../controller/dto/auth/rest-response-signup-jwt";
import { Nullable } from "@repo/be-core";

export interface IAuthService {
  getLoginToken(user: VerifiedUserPayload): Promise<RestResponseJwt>;

  getSignupToken(user: OauthUserPayload): Promise<RestResponseSignupJwt>;

  signup(payload: {
    signupToken: string;
    username: string;
    email: string;
  }): Promise<RestResponseJwt>;

  // for oauth
  getOauthUser(
    provider: string,
    providerId: string,
  ): Promise<Nullable<VerifiedUserPayload>>;

  getUser(payload: { id: string }): Promise<Nullable<VerifiedUserPayload>>;

  isUserInGroup(userId: string, groupId: string): Promise<boolean>;

  isGroupOwner(userId: string, groupId: string): Promise<boolean>;
}
