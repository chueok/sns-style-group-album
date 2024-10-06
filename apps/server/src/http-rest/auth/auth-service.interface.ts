import { VerifiedUserPayload } from "./type/verified-user-payload";
import { OauthUserPayload } from "./type/oauth-user-payload";
import { RestResponseJwt } from "../controller/dto/auth/rest-response-jwt";
import { RestResponseSignupJwt } from "../controller/dto/auth/rest-response-signup-jwt";
import { Nullable } from "@repo/be-core";
import { ISignupPort } from "./port/signup-port";
import { JwtUserPayload } from "./type/jwt-user-payload";

export interface IAuthService {
  getLoginToken(user: VerifiedUserPayload): Promise<RestResponseJwt>;
  validateLoginToken(token: string): JwtUserPayload;

  getSignupToken(user: OauthUserPayload): Promise<RestResponseSignupJwt>;

  signup(payload: ISignupPort): Promise<RestResponseJwt>;

  // for oauth
  getOauthUser(
    provider: string,
    providerId: string,
  ): Promise<Nullable<VerifiedUserPayload>>;

  getUser(payload: { id: string }): Promise<VerifiedUserPayload>;

  getGroupMember(payload: {
    userId: string;
    groupId: string;
  }): Promise<VerifiedUserPayload>;

  getGroupOwner(payload: {
    userId: string;
    groupId: string;
  }): Promise<VerifiedUserPayload>;

  getContentOwner(payload: {
    userId: string;
    groupId: string;
    contentId: string;
  }): Promise<VerifiedUserPayload>;

  getCommentOwner(payload: {
    userId: string;
    groupId: string;
    commentId: string;
  }): Promise<VerifiedUserPayload>;
}
