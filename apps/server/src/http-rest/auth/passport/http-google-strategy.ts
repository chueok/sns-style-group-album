import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Profile, Strategy, VerifyCallback } from "passport-google-oauth20";
import { ServerConfig } from "../../../config/server-config";
import { AuthProviderEnum } from "../auth-provider-enum";
import { HttpAuthService } from "../http-auth-service";
import { HttpUserPayload } from "../type/http-user";
import { Code, Exception, Optional } from "@repo/be-core";
import { HttpOauthUser, HttpOauthUserPayload } from "../type/http-oauth-user";
import { validateSync } from "class-validator";

@Injectable()
export class HttpGoogleStrategy extends PassportStrategy(
  Strategy,
  AuthProviderEnum.GOOGLE,
) {
  constructor(private readonly authService: HttpAuthService) {
    super({
      clientID: ServerConfig.OAUTH_GOOGLE_ID,
      clientSecret: ServerConfig.OAUTH_GOOGLE_SECRET,
      callbackURL: ServerConfig.OAUTH_GOOGLE_REDIRECT,
      scope: ["email", "profile"],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: Profile,
    done: VerifyCallback,
  ): Promise<Optional<HttpOauthUserPayload | HttpUserPayload>> {
    try {
      const { provider, id, profileUrl, displayName, name, emails } = profile;

      const user = await this.authService.getOauthUser(provider, id);
      // 신규 유저
      if (!user) {
        const oauthUser = new HttpOauthUser();
        oauthUser.provider = provider;
        oauthUser.providerId = id;
        oauthUser.profileUrl = profileUrl;
        oauthUser.email = emails?.at(0)?.value || "";
        const errors = validateSync(oauthUser);

        if (errors.length > 0) {
          throw Exception.new({ code: Code.BAD_REQUEST_ERROR });
        }

        return oauthUser.toObject();
      }

      return user;
    } catch (error) {
      done(error);
    }
  }
}
