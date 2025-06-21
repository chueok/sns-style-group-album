import { v4 } from 'uuid';
import {
  Code,
  EContentCategory,
  Exception,
  IObjectStoragePort,
  TMedia,
} from '../..';
import {
  IContentRepository,
  TMediaPaginationParams,
  TMediaPaginationResult,
} from './content-repository.interface';

const generateObjectStorageKey = (payload: {
  groupId: string;
  ownerId: string;
  fileName: string;
}): string => {
  return `${payload.groupId}/${payload.ownerId}/${payload.fileName}`;
};

export class ContentService {
  private readonly bucketName: string = 'medias';
  private readonly uploadUrlExpiryTime: number = 5 * 60; // 5 minutes

  constructor(
    private readonly contentRepository: IContentRepository,
    private readonly mediaObjectStorage: IObjectStoragePort
  ) {}

  // TODO: 최대 업로드 개수 제한 필요.
  // 파일 최대 크기 제한? 필요할까?
  /**
   * 한개의 url 이라도 생성 실패하면 에러 발생.
   * 추후 index 별 에러 처리 필요.
   */
  async generateMediaUploadUrls(payload: {
    requesterId: string;
    groupId: string;
    media: {
      size: number;
      ext: string;
      mimeType: string;
    }[];
  }): Promise<string[]> {
    const { requesterId, groupId, media } = payload;

    const memberId = await this.contentRepository.findMemberId({
      userId: requesterId,
      groupId,
    });
    if (!memberId) {
      throw Exception.new({
        code: Code.UNAUTHORIZED_ERROR,
        overrideMessage: 'User is not a member of the group',
      });
    }

    const newMedia = media.map((m) => {
      const originalPath = generateObjectStorageKey({
        groupId,
        ownerId: memberId,
        fileName: v4(),
      });
      return {
        ...m,
        thumbnailPath: originalPath,
        originalPath,
        largePath: originalPath,
      };
    });

    const uploadUrls: string[] = [];
    const promises = newMedia.map(async (m) => {
      const url = await this.mediaObjectStorage.getPresignedUrlForUpload(
        this.bucketName,
        m.originalPath,
        this.uploadUrlExpiryTime
      );
      uploadUrls.push(url);
    });

    await Promise.all(promises);
    if (uploadUrls.length !== newMedia.length) {
      throw Exception.new({
        code: Code.INTERNAL_ERROR,
        overrideMessage: 'Failed to generate upload urls',
      });
    }

    return uploadUrls;
  }

  async getGroupMedia(payload: {
    requesterId: string;
    groupId: string;
    pagination: TMediaPaginationParams;
  }): Promise<TMediaPaginationResult<TMedia>> {
    const { groupId, requesterId, pagination } = payload;

    const memberId = await this.contentRepository.findMemberId({
      userId: requesterId,
      groupId,
    });
    if (!memberId) {
      throw Exception.new({
        code: Code.UNAUTHORIZED_ERROR,
        overrideMessage: 'User is not a member of the group',
      });
    }

    const media = await this.contentRepository.findMediaInGroupOrderByCreated({
      groupId,
      pagination,
    });

    const resolvedMedia = await this.resolveSignedUrlList(media.items);

    return {
      ...media,
      items: resolvedMedia,
    };
  }

  async getMedia(payload: {
    requesterId: string;
    contentId: string;
  }): Promise<TMedia> {
    const { requesterId, contentId } = payload;

    const hasAccess = await this.contentRepository.hasAccessToContent({
      userId: requesterId,
      contentId: contentId,
    });
    if (!hasAccess) {
      throw Exception.new({
        code: Code.UNAUTHORIZED_ERROR,
        overrideMessage: 'User does not have access to the media',
      });
    }

    const media = await this.contentRepository.findMediaById(contentId);
    const resolvedMedia = await this.resolveSignedUrl(media);

    return resolvedMedia;
  }

  private async resolveSignedUrl(media: TMedia): Promise<TMedia> {
    if (media.category === EContentCategory.IMAGE) {
      if (media.largeUrl) {
        media.largeUrl =
          await this.mediaObjectStorage.getPresignedUrlForDownload(
            this.bucketName,
            media.largeUrl
          );
      }
    }
    if (media.originalUrl) {
      media.originalUrl =
        await this.mediaObjectStorage.getPresignedUrlForDownload(
          this.bucketName,
          media.originalUrl
        );
    }
    if (media.thumbnailUrl) {
      media.thumbnailUrl =
        await this.mediaObjectStorage.getPresignedUrlForDownload(
          this.bucketName,
          media.thumbnailUrl
        );
    }
    return media;
  }

  private async resolveSignedUrlList(mediaList: TMedia[]): Promise<TMedia[]> {
    const resolvedMediaList: TMedia[] = [];

    await Promise.all(
      mediaList.map(async (media) => {
        const resolvedMedia = await this.resolveSignedUrl(media);
        resolvedMediaList.push(resolvedMedia);
      })
    );

    if (resolvedMediaList.length !== mediaList.length) {
      throw Exception.new({
        code: Code.INTERNAL_ERROR,
        overrideMessage: 'Failed to resolve signed url list',
      });
    }

    return resolvedMediaList;
  }
}
