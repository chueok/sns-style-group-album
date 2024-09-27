import { GroupId } from "../../group/entity/type/group-id";

export class UserGroupProfile {
  groupId: GroupId;

  nickname: string;

  hasProfileImage: boolean;

  constructor(payload: {
    groupId: GroupId;
    nickname: string;
    hasProfileImage: boolean;
  }) {
    this.groupId = payload.groupId;
    this.nickname = payload.nickname;
    this.hasProfileImage = payload.hasProfileImage;
  }
}
