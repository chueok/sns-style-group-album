import { IsEmail, IsOptional, IsString, IsUrl } from 'class-validator';

export class OauthUserModel {
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

  toObject(): OauthUserPayload {
    return {
      provider: this.provider,
      providerId: this.providerId,
      profileUrl: this.profileUrl,
      email: this.email,
    };
  }
}

export type OauthUserPayload = {
  provider: string;
  providerId: string;
  profileUrl?: string;
  email?: string;
};

export function isHttpOauthUserPayload(
  payload: object
): payload is OauthUserPayload {
  return 'provider' in payload && 'providerId' in payload;
}

export type HttpRequestWithOauthUser = Request & {
  oauthUser: OauthUserPayload;
};
