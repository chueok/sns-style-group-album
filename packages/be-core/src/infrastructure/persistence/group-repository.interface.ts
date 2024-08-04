import { Nullable } from "../../common/type/common-types";
import { Group } from "../../domain/group/entity/group";

export interface IGroupRepository {
  createGroup(group: Group): Promise<Group>;

  updateGroup(group: Group): Promise<Group>;

  deleteGroup(groupId: string): Promise<boolean>;

  findGroupById(groupId: string): Promise<Nullable<Group>>;

  findGroupsByOwnerId(ownerId: string): Promise<Group[]>;

  findGroupsByMemberId(memberId: string): Promise<Group[]>;
}
