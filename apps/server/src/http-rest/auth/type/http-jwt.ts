import { HttpOauthUserPayload } from "./http-oauth-user";
import { HttpUserPayload } from "./http-user";

export type HttpJwtUserPayload = HttpUserPayload;
export type HttpJwtOauthPayload = HttpOauthUserPayload;

export function isHttpUserPayload(input: object): input is HttpUserPayload {
  return "id" in input;
}

export function isHttpJwtOauthPayload(
  input: object,
): input is HttpJwtOauthPayload {
  return "provider" in input;
}
