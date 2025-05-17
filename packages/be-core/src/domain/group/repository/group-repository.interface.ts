import { Nullable } from '../../../common/type/common-types';
import { Group } from '../entity/group';

export interface IGroupRepository {
  createGroup(group: Group): Promise<boolean>;

  updateGroup(group: Group): Promise<boolean>;

  findGroupById(groupId: string): Promise<Nullable<Group>>;

  findGroupListByOwnerId(ownerId: string): Promise<Group[]>;

  findGroupListByUserId(userId: string): Promise<Group[]>;

  // delete is not supported
}
