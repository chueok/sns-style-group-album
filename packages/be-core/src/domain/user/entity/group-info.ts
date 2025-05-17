import { GroupId } from '../../group/entity/type/group-id';

export class GroupInfo {
  readonly groupId: GroupId;

  readonly name: string;

  readonly ownerId: string;

  readonly ownerNickname: string;

  constructor(payload: GroupInfo) {
    this.groupId = payload.groupId;
    this.name = payload.name;
    this.ownerId = payload.ownerId;
    this.ownerNickname = payload.ownerNickname;
  }
}
