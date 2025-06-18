export interface IObjectStoragePort {
  uploadFile(bucketName: string, key: string, filePath: string): Promise<void>;
  getPresignedUrlForUpload(
    bucketName: string,
    key: string,
    expiresInSeconds?: number
  ): Promise<string>;
  getPresignedUrlForDownload(
    bucketName: string,
    key: string,
    expiresInSeconds?: number
  ): Promise<string>;
  getPublicUrlForDownload(bucketName: string, key: string): Promise<string>;
  deleteObject(bucketName: string, key: string): Promise<void>;
}
