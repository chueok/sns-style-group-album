import { Nullable } from "@repo/be-core";

export type HttpUserPayload = {
  id: string;
  username: string;
  thumbnailRelativePath: Nullable<string>;
};

export type HttpRequestWithUser = Request & {
  user: HttpUserPayload;
};
