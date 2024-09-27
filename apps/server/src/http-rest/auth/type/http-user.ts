import { IsString } from "class-validator";

export class HttpUserModel {
  @IsString()
  id!: string;

  toObject(): HttpUserPayload {
    return {
      id: this.id,
    };
  }
}

export type HttpUserPayload = {
  id: string;
};

export type HttpRequestWithUser = Request & {
  user: HttpUserPayload;
};
