export type HttpUserPayload = {
  id: string;

  username: string;

  thumbnailRelativePath?: string;
};

export type HttpRequestWithUser = Request & {
  user: HttpUserPayload;
};
