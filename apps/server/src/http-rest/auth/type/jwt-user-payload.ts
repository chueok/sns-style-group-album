import { IsString } from "class-validator";

export class JwtUserModel {
  @IsString()
  id!: string;

  toObject(): JwtUserPayload {
    return {
      id: this.id,
    };
  }
}
export type JwtUserPayload = {
  id: string;
};

export function isHttpUserPayload(input: object): input is JwtUserPayload {
  return "id" in input && typeof input.id === "string";
}
