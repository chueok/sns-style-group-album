export interface IObjectStorageAdapter {
  uploadFile(bucketName: string, key: string, filePath: string): Promise<void>;
  getPresignedUrlForUpload(
    bucketName: string,
    key: string,
    expires?: number,
  ): Promise<string>;
  getPresignedUrlForDownload(
    bucketName: string,
    key: string,
    expires?: number,
  ): Promise<string>;
  getPublicUrlForDownload(bucketName: string, key: string): Promise<string>;
}
