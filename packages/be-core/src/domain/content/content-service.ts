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

    const member = await this.contentRepository.findApprovedMember({
      userId: requesterId,
      groupId,
    });
    if (!member) {
      throw Exception.new({
        code: Code.UNAUTHORIZED_ERROR,
        overrideMessage: 'User is not a member of the group',
      });
    }

    // storage object key 생성
    const newMedia = media.map((m) => {
      const originalPath = generateObjectStorageKey({
        groupId,
        ownerId: member.id,
        fileName: v4(),
      });
      return {
        ...m,
        thumbnailPath: originalPath, // TODO: 썸네일 파일 생성 로직 추가 필요.
        originalPath,
        largePath: originalPath,
      };
    });

    // 미디어 entity 생성
    await this.contentRepository.createMedia({
      groupId,
      ownerId: member.id,
      media: newMedia,
    });

    // 업로드를 위한 presigned url 생성
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

    const member = await this.contentRepository.findApprovedMember({
      userId: requesterId,
      groupId,
    });
    if (!member) {
      throw Exception.new({
        code: Code.UNAUTHORIZED_ERROR,
        overrideMessage: 'User is not a member of the group',
      });
    }

    const media = await this.contentRepository.findMediaListBy(
      {
        groupId,
      },
      pagination
    );

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

    const content = await this.contentRepository.findMediaById(contentId);
    if (!content) {
      throw Exception.new({
        code: Code.UTIL_NOT_FOUND_ERROR,
        overrideMessage: 'Media not found',
      });
    }

    // NOTE: 접근 권한 확인이 content 조회 이후 이루어지고 있음. 수정 시 주의 필요.
    const member = await this.contentRepository.findApprovedMember({
      userId: requesterId,
      groupId: content.groupId,
    });
    if (!member) {
      throw Exception.new({
        code: Code.UNAUTHORIZED_ERROR,
        overrideMessage: 'User is not a member of the group',
      });
    }

    const resolvedMedia = await this.resolveSignedUrl(content);

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
    const results = await Promise.allSettled(
      mediaList.map(async (media) => {
        const resolvedMedia = await this.resolveSignedUrl(media);
        return resolvedMedia;
      })
    );

    const resolvedMediaList: TMedia[] = [];
    results.forEach((result) => {
      if (result.status === 'fulfilled') {
        resolvedMediaList.push(result.value);
      }
    });

    if (resolvedMediaList.length !== mediaList.length) {
      throw Exception.new({
        code: Code.INTERNAL_ERROR,
        overrideMessage: 'Failed to resolve signed url list',
      });
    }

    return resolvedMediaList;
  }
}
