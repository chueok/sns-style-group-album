export enum ESystemCommentCategory {
  GROUP_CREATED = 'group_created',
  MEMBER_JOINED = 'member_joined',
  MEMBER_LEFT = 'member_left',
  MEMBER_DROP_OUT = 'member_drop_out',
  MEDIA_UPLOAD = 'media_upload',
}

export type TSystemCommentTag = {
  at: number[];
  memberId: string;
};

export interface ISystemContentCommentPort {
  addComment(payload: {
    groupId: string;
    category: ESystemCommentCategory;
    text: string;
    tags: TSystemCommentTag[];
    subText?: string;
    contentId?: string;
  }): Promise<void>;

  addContent(payload: {
    groupId: string;
    refContentIds: string[];
  }): Promise<string>;
}
/**
 * 1. Comment 가 여러 content에 속할 수 있음
 *
 * 2. Comment는 하나의 content에 속하며,
 *    system-content를 만들어 해당 content를 참조
 */
