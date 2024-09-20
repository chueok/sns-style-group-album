import {
  IsEmail,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
} from "class-validator";
import { HttpUserModel, HttpUserPayload } from "./http-user";

export class HttpJwtUserModel extends HttpUserModel {}
export type HttpJwtUserPayload = HttpUserPayload;

export class HttpJwtSignupModel {
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

  toObject(): HttpJwtSignupPayload {
    return {
      provider: this.provider,
      providerId: this.providerId,
      profileUrl: this.profileUrl,
      email: this.email,
      createdTimestamp: this.createdTimestamp,
    };
  }
}
export type HttpJwtSignupPayload = {
  provider: string;
  providerId: string;
  profileUrl?: string;
  email?: string;
  createdTimestamp: number;
};

export function isHttpUserPayload(input: object): input is HttpUserPayload {
  return "id" in input;
}

export function isHttpJwtOauthPayload(
  input: object,
): input is HttpJwtSignupPayload {
  return "provider" in input;
}
