import { IsString } from 'class-validator';

export class VerifiedUserModel {
  @IsString()
  id!: string;

  toObject(): VerifiedUserPayload {
    return {
      id: this.id,
    };
  }
}

export type VerifiedUserPayload = {
  id: string;
};

export type HttpRequestWithUser = Request & {
  user: VerifiedUserPayload;
};
