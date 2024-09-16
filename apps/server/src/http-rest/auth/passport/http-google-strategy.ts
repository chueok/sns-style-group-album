import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Profile, Strategy, VerifyCallback } from "passport-google-oauth20";
import { ServerConfig } from "../../../config/server-config";
import { AuthProviderEnum } from "../auth-provider-enum";
import { HttpAuthService } from "../http-auth-service";
import { HttpOauthUserPayloadValidator } from "../type/http-oauth-user";
import { validateSync } from "class-validator";
import { HttpUserPayload } from "../type/http-user";
import { Optional } from "@repo/be-core";

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
  ): Promise<Optional<HttpOauthUserPayloadValidator | HttpUserPayload>> {
    try {
      const { provider, id, profileUrl, displayName, name, emails } = profile;

      const user = await this.authService.getOauthUser(provider, id);
      if (!user) {
        // create temporary user
        const oauthUser = new HttpOauthUserPayloadValidator({
          provider,
          providerId: id,

          displayName,
          familyName: name?.familyName,
          givenName: name?.givenName,
          middleName: name?.middleName,

          profileUrl,
          email: emails?.at(0)?.value || "",
        });

        const errors = validateSync(oauthUser);
        if (errors.length > 0) {
          throw new Error(errors.toString());
        }
        return oauthUser;
      }

      return user;
    } catch (error) {
      done(error);
    }
  }
}
