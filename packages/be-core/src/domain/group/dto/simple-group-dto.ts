import { UserId } from '../../user/entity/type/user-id';
import { GroupId } from '../entity/type/group-id';

export class SimpleGroupDTO {
  readonly id: GroupId;
  readonly name: string;
  readonly ownerId: UserId;
  readonly ownerNickname: string;

  constructor(payload: SimpleGroupDTO) {
    this.id = payload.id;
    this.name = payload.name;
    this.ownerId = payload.ownerId;
    this.ownerNickname = payload.ownerNickname;
  }
}
