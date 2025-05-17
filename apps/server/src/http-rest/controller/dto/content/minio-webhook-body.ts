export type MinioWebhookBody = {
  EventName: string;
  Key: string;
  Records: Record[];
};

type Record = {
  eventVersion: string;
  eventSource: string;
  awsRegion: string;
  eventTime: Date;
  eventName: string;
  userIdentity: ErIdentity;
  requestParameters: RequestParameters;
  responseElements: ResponseElements;
  s3: S3;
  source: Source;
};

type RequestParameters = {
  principalId: string;
  region: string;
  sourceIPAddress: string;
};

type ResponseElements = {
  'x-amz-id-2': string;
  'x-amz-request-id': string;
  'x-minio-deployment-id': string;
  'x-minio-origin-endpoint': string;
};

type S3 = {
  s3SchemaVersion: string;
  configurationId: string;
  bucket: Bucket;
  object: S3Object;
};

type Bucket = {
  name: string;
  ownerIdentity: ErIdentity;
  arn: string;
};

type ErIdentity = {
  principalId: string;
};

type S3Object = {
  key: string;
  size: number;
  eTag: string;
  contentType: string;
  userMetadata: UserMetadata;
  sequencer: string;
};

type UserMetadata = {
  'content-type': string;
};

type Source = {
  host: string;
  port: string;
  userAgent: string;
};
