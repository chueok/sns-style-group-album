import { faker } from "@faker-js/faker";
import { IObjectStoragePort } from "@repo/be-core";

export class MockObjectStorage implements IObjectStoragePort {
  async uploadFile(key: string, filePath: string): Promise<void> {
    return;
  }
  async getPresignedUrlForUpload(
    key: string,
    expires?: number,
  ): Promise<string> {
    return faker.internet.url();
  }
  async getPresignedUrlForDownload(
    key: string,
    expires?: number,
  ): Promise<string> {
    return faker.internet.url();
  }
  async getPublicUrlForDownload(key: string): Promise<string> {
    return faker.internet.url();
  }
}
