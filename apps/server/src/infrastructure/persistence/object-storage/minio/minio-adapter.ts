import { Code, Exception, IObjectStoragePort } from "@repo/be-core";
import { ServerConfig } from "../../../../config/server-config";
import { Client } from "minio";
import { MinioPolicy } from "./minio-policy";
import { Injectable, Logger } from "@nestjs/common";

@Injectable()
export class MinioObjectStorageFactory {
  private readonly basePath = ServerConfig.OBJECT_STORAGE_BASE_PATH;
  private readonly client = new Client({
    accessKey: ServerConfig.OBJECT_STORAGE_ACCESS_KEY,
    secretKey: ServerConfig.OBJECT_STORAGE_SECRET_KEY,
    endPoint: ServerConfig.OBJECT_STORAGE_ENDPOINT,
    port: ServerConfig.OBJECT_STORAGE_PORT,
    useSSL: ServerConfig.OBJECT_STORAGE_USE_SSL,
    pathStyle: true,
  });

  private readonly logger = new Logger(MinioObjectStorageFactory.name);

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

  async getObjectStorageAdapter(
    bucketName: string,
  ): Promise<IObjectStoragePort> {
    return {
      uploadFile: async (key: string, filePath: string) => {
        await this.uploadFile(bucketName, key, filePath);
      },
      getPresignedUrlForUpload: async (key: string, expires?: number) => {
        return this.getPresignedUrlForUpload(bucketName, key, expires);
      },
      getPresignedUrlForDownload: async (key: string, expires?: number) => {
        return this.getPresignedUrlForDownload(bucketName, key, expires);
      },
      getPublicUrlForDownload: async (key: string) => {
        return this.getPublicUrlForDownload(bucketName, key);
      },
    };
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