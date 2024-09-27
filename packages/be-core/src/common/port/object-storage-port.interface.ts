export interface IObjectStoragePort {
  uploadFile(key: string, filePath: string): Promise<void>;
  getPresignedUrlForUpload(key: string, expires?: number): Promise<string>;
  getPresignedUrlForDownload(key: string, expires?: number): Promise<string>;
  getPublicUrlForDownload(key: string): Promise<string>;
}
