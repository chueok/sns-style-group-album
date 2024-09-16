import { IsEmail, IsOptional, IsString, IsUrl } from "class-validator";

export type HttpOauthUserPayload = {
  provider: string;
  providerId: string;
  profileUrl?: string;
  email?: string;
};

export class HttpOauthUser {
  @IsString()
  provider!: string;

  @IsString()
  providerId!: string;

  @IsOptional()
  @IsUrl()
  profileUrl?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  toObject(): HttpOauthUserPayload {
    return {
      provider: this.provider,
      providerId: this.providerId,
      profileUrl: this.profileUrl,
      email: this.email,
    };
  }
}

export function isHttpOauthUserPayload(
  payload: object,
): payload is HttpOauthUserPayload {
  return "provider" in payload && "providerId" in payload;
}

export type HttpRequestWithOauthUser = Request & {
  oauthUser: HttpOauthUserPayload;
};
