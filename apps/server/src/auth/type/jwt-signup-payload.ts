import {
  IsString,
  IsOptional,
  IsUrl,
  IsEmail,
  IsNumber,
} from 'class-validator';

export class JwtSignupModel {
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

  @IsNumber()
  createdTimestamp!: number;

  toObject(): JwtSignupPayload {
    return {
      provider: this.provider,
      providerId: this.providerId,
      profileUrl: this.profileUrl,
      email: this.email,
      createdTimestamp: this.createdTimestamp,
    };
  }
}
export type JwtSignupPayload = {
  provider: string;
  providerId: string;
  profileUrl?: string;
  email?: string;
  createdTimestamp: number;
};

export function isHttpJwtOauthPayload(
  input: object
): input is JwtSignupPayload {
  return 'provider' in input;
}
