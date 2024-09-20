import { Nullable } from "@repo/be-core";
import { IsOptional, IsString, IsUrl } from "class-validator";

export class HttpUserModel {
  @IsString()
  id!: string;

  @IsString()
  username!: string;

  @IsOptional()
  @IsUrl()
  thumbnailRelativePath!: Nullable<string>;

  toObject(): HttpUserPayload {
    return {
      id: this.id,
      username: this.username,
      thumbnailRelativePath: this.thumbnailRelativePath,
    };
  }
}

export type HttpUserPayload = {
  id: string;
  username: string;
  thumbnailRelativePath: Nullable<string>;
};

export type HttpRequestWithUser = Request & {
  user: HttpUserPayload;
};
