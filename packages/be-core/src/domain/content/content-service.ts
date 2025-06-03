import { v4 } from 'uuid';
import { Code, Exception, IObjectStoragePort } from '../..';
import { IContentRepository } from './content-repository.interface';
import { EContentCategory } from './type/content-category';

const isImageMimeType = (mimeType: string): boolean => {
  return mimeType.startsWith('image/');
};

const isVideoMimeType = (mimeType: string): boolean => {
  return mimeType.startsWith('video/');
};

const getContentCategory = (
  mimeType: string
): EContentCategory.IMAGE | EContentCategory.VIDEO => {
  if (isImageMimeType(mimeType)) {
    return EContentCategory.IMAGE;
  }
  if (isVideoMimeType(mimeType)) {
    return EContentCategory.VIDEO;
  }
  throw Exception.new({
    code: Code.INTERNAL_ERROR,
    overrideMessage:
      'Unsupported media type. Only image and video are allowed.',
  });
};

export class ContentService {
  constructor(
    private readonly contentRepository: IContentRepository,
    private readonly objectStorage: IObjectStoragePort,
    private readonly bucketName: string
  ) {}

  // TODO: 최대 업로드 개수 제한 필요.
  async generateMediaUploadUrls(payload: {
    requesterId: string;
    groupId: string;
    mimeTypeList: string[];
  }): Promise<string[]> {
    const { requesterId, groupId, mimeTypeList } = payload;

    const isMember = await this.contentRepository.isGroupMember({
      userId: requesterId,
      groupId,
    });
    if (!isMember) {
      throw Exception.new({
        code: Code.UNAUTHORIZED_ERROR,
        overrideMessage: 'User is not a member of the group',
      });
    }

    const promises = await Promise.all(
      mimeTypeList.map(async (mimeType) => {
        const contentCategory = getContentCategory(mimeType);
        const fileName = v4();
        const key = generateKey({
          groupId,
          userId: requesterId,
          contentCategory,
          fileName,
        });

        const url = await this.objectStorage.getPresignedUrlForUpload(
          this.bucketName,
          key
        );

        return url;
      })
    );

    return promises;
  }
}

const generateKey = (payload: {
  groupId: string;
  userId: string;
  contentCategory: EContentCategory.IMAGE | EContentCategory.VIDEO;
  fileName: string;
}): string => {
  return `${payload.groupId}/${payload.userId}/${payload.contentCategory}/${payload.fileName}`;
};
