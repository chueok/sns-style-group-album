import { GroupMember } from "../group-member";

type CreateNewGroupEntityPayload = {
  ownerId: string;
  name: string;
};

type CreateExistingGroupEntityPayload = CreateNewGroupEntityPayload & {
  id: string;
  createdDateTime: Date;
  members: GroupMember[];
  updatedDateTime?: Date;
  deletedDateTime?: Date;
};

type CreateGroupEntityPayloadMap = {
  all: CreateNewGroupEntityPayload | CreateExistingGroupEntityPayload;
  new: CreateNewGroupEntityPayload;
  existing: CreateExistingGroupEntityPayload;
};

export type CreateGroupEntityPayload<
  T extends keyof CreateGroupEntityPayloadMap,
> = CreateGroupEntityPayloadMap[T];