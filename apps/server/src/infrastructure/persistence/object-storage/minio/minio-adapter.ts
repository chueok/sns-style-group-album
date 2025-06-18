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

  constructor() {
    // NOTE: 개발 환경에서는 모든 버킷을 삭제하고 시작하도록 함
    if (ServerConfig.NODE_ENV === 'development') {
      this.clearAllBuckets().catch((error) => {
        this.logger.error('Failed to clear buckets:', error);
      });
    }
  }

  async deleteObject(bucketName: string, key: string): Promise<void> {
    await this.client.removeObject(bucketName, key);
  }

  private async clearAllBuckets(): Promise<void> {
    if (ServerConfig.NODE_ENV !== 'development') {
      process.exit(1);
    }
    try {
      const buckets = await this.client.listBuckets();

      for (const bucket of buckets) {
        const objectsStream = this.client.listObjects(bucket.name, '', true);
        const objectsToDelete: string[] = [];

        for await (const obj of objectsStream) {
          objectsToDelete.push(obj.name);
        }

        if (objectsToDelete.length > 0) {
          await this.client.removeObjects(bucket.name, objectsToDelete);
          this.logger.log(
            `Cleared ${objectsToDelete.length} objects from bucket ${bucket.name}`
          );
        }
      }
    } catch (error) {
      this.logger.error('Error clearing buckets:', error);
      throw error;
    }
  }

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
