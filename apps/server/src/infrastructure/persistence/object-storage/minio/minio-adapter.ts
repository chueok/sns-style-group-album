import { Code, Exception, IObjectStorageAdapter } from "@repo/be-core";
import { ServerConfig } from "../../../../config/server-config";
import { Client } from "minio";
import { MinioPolicy } from "./minio-policy";
import { Injectable, Logger } from "@nestjs/common";

@Injectable()
export class MinioObjectStorageAdapter implements IObjectStorageAdapter {
  private readonly basePath = ServerConfig.OBJECT_STORAGE_BASE_PATH;
  private readonly client = new Client({
    accessKey: ServerConfig.OBJECT_STORAGE_ACCESS_KEY,
    secretKey: ServerConfig.OBJECT_STORAGE_SECRET_KEY,
    endPoint: ServerConfig.OBJECT_STORAGE_ENDPOINT,
    port: ServerConfig.OBJECT_STORAGE_PORT,
    useSSL: ServerConfig.OBJECT_STORAGE_USE_SSL,
    pathStyle: true,
  });

  private readonly logger = new Logger(MinioObjectStorageAdapter.name);

  async init() {
    const isMediaBucketExist = await this.client.bucketExists(
      ServerConfig.OBJECT_STORAGE_MEDIA_BUCKET,
    );
    if (!isMediaBucketExist) {
      await this.client.makeBucket(ServerConfig.OBJECT_STORAGE_MEDIA_BUCKET);
      this.logger.log(
        `Bucket ${ServerConfig.OBJECT_STORAGE_MEDIA_BUCKET} created`,
      );
    }
    const isPublicBucketExist = await this.client.bucketExists(
      ServerConfig.OBJECT_STORAGE_PUBLIC_BUCKET,
    );
    if (!isPublicBucketExist) {
      await this.client.makeBucket(ServerConfig.OBJECT_STORAGE_PUBLIC_BUCKET);
      this.logger.log(
        `Bucket ${ServerConfig.OBJECT_STORAGE_PUBLIC_BUCKET} created`,
      );
      await this.client.setBucketPolicy(
        ServerConfig.OBJECT_STORAGE_PUBLIC_BUCKET,
        JSON.stringify(MinioPolicy.PUBLIC_BUCKET),
      );
      this.logger.log(
        `Bucket ${ServerConfig.OBJECT_STORAGE_PUBLIC_BUCKET} policy set`,
      );
    }
  }

  async uploadFile(
    bucketName: string,
    key: string,
    filePath: string,
  ): Promise<void> {
    await this.client.fPutObject(bucketName, key, filePath);
  }

  async getPresignedUrlForUpload(
    bucketName: string,
    key: string,
    expires?: number,
  ): Promise<string> {
    return this.client.presignedPutObject(bucketName, key, expires);
  }

  async getPresignedUrlForDownload(
    bucketName: string,
    key: string,
    expires?: number,
  ): Promise<string> {
    return this.client.presignedGetObject(bucketName, key, expires);
  }

  async getPublicUrlForDownload(
    bucketName: string,
    key: string,
  ): Promise<string> {
    if (key.length > 0 && key[0] === "/") {
      key = key.slice(1);
    } else {
      throw Exception.new({
        code: Code.INTERNAL_ERROR,
        overrideMessage: "key is invalid",
      });
    }
    return `${this.basePath}/${bucketName}/${key}`;
  }
}
