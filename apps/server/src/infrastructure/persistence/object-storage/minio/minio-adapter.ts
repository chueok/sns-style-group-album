import { Code, Exception, IObjectStoragePort } from '@repo/be-core';
import { ServerConfig } from '../../../../config/server-config';
import { Client } from 'minio';
import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class MinioObjectStorage implements IObjectStoragePort {
  private readonly basePath = ServerConfig.OBJECT_STORAGE_BASE_PATH;
  private readonly client = new Client({
    accessKey: ServerConfig.OBJECT_STORAGE_ACCESS_KEY,
    secretKey: ServerConfig.OBJECT_STORAGE_SECRET_KEY,
    endPoint: ServerConfig.OBJECT_STORAGE_ENDPOINT,
    port: ServerConfig.OBJECT_STORAGE_PORT,
    useSSL: ServerConfig.OBJECT_STORAGE_USE_SSL,
    pathStyle: true,
  });

  private readonly logger = new Logger(MinioObjectStorage.name);

  private readonly defaultExpires = 60 * 5; // 5 minutes

  async uploadFile(
    bucketName: string,
    key: string,
    filePath: string
  ): Promise<void> {
    await this.client.fPutObject(bucketName, key, filePath);
  }

  async getPresignedUrlForUpload(
    bucketName: string,
    key: string,
    expiresInSeconds?: number
  ): Promise<string> {
    return this.client.presignedPutObject(
      bucketName,
      key,
      expiresInSeconds || this.defaultExpires
    );
  }

  async getPresignedUrlForDownload(
    bucketName: string,
    key: string,
    expiresInSeconds?: number
  ): Promise<string> {
    return this.client.presignedGetObject(
      bucketName,
      key,
      expiresInSeconds || this.defaultExpires
    );
  }

  async getPublicUrlForDownload(
    bucketName: string,
    key: string
  ): Promise<string> {
    if (key.length > 0 && key[0] === '/') {
      key = key.slice(1);
    } else {
      throw Exception.new({
        code: Code.INTERNAL_ERROR,
        overrideMessage: 'key is invalid',
      });
    }
    return `${this.basePath}/${bucketName}/${key}`;
  }
}
