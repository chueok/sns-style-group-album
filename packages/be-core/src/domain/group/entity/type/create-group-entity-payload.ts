import { GroupMember } from '../group-member';

type CreateNewGroupEntityPayload = {
  ownerId: string;
  name: string;
};

type CreateExistingGroupEntityPayload = {
  id: string;
  createdDateTime: Date;
  ownerId: string;
  name: string;
  members: GroupMember[];
  updatedDateTime?: Date;
  deletedDateTime?: Date;
};

export type CreateGroupEntityPayload =
  | CreateNewGroupEntityPayload
  | CreateExistingGroupEntityPayload;
