import { IsEmail, IsOptional, IsString, IsUrl } from "class-validator";

export class HttpOauthUserPayloadValidator {
  @IsString()
  provider!: string;

  @IsString()
  providerId!: string;

  @IsOptional()
  @IsString()
  displayName?: string;

  @IsOptional()
  @IsString()
  familyName?: string;

  @IsOptional()
  @IsString()
  givenName?: string;

  @IsOptional()
  @IsString()
  middleName?: string;

  @IsOptional()
  @IsUrl()
  profileUrl?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  constructor(payload: HttpOauthUserPayloadValidator) {
    Object.assign(this, payload);
  }
}

export type HttpRequestWithOauthUser = Request & {
  oauthUser: HttpOauthUserPayloadValidator;
};
