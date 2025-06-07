import { Code, Exception, TMedia } from '../..';
import {
  IContentRepository,
  TMediaPaginationParams,
  TMediaPaginationResult,
} from './content-repository.interface';

export class ContentService {
  constructor(private readonly contentRepository: IContentRepository) {}

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

    const urls = await this.contentRepository.createMediaUploadUrls({
      groupId,
      ownerId: requesterId,
      media: media,
    });
    return urls;
  }

  async getGroupMedia(payload: {
    requesterId: string;
    groupId: string;
    pagination: TMediaPaginationParams;
  }): Promise<TMediaPaginationResult<TMedia>> {
    const { groupId, requesterId, pagination } = payload;

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

    const media = await this.contentRepository.findMediaInGroupOrderByCreated({
      groupId,
      pagination,
    });

    return media;
  }

  async getMedia(payload: {
    requesterId: string;
    contentId: string;
  }): Promise<TMedia> {
    const { requesterId, contentId } = payload;

    const hasAccess = await this.contentRepository.hasAccessToMedia({
      userId: requesterId,
      mediaId: contentId,
    });
    if (!hasAccess) {
      throw Exception.new({
        code: Code.UNAUTHORIZED_ERROR,
        overrideMessage: 'User does not have access to the media',
      });
    }

    const media = await this.contentRepository.findMediaById(contentId);
    return media;
  }
}
