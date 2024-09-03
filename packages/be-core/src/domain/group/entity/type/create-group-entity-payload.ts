import { Nullable } from "../../../../common/type/common-types";

type CreateNewGroupEntityPayload = {
  ownerId: string;
  name: string;
};

type CreateExistingGroupEntityPayload = CreateNewGroupEntityPayload & {
  id: string;
  createdDateTime: Date;
  members: string[];
  updatedDateTime: Nullable<Date>;
  deletedDateTime: Nullable<Date>;
};

type CreateGroupEntityPayloadMap = {
  all: CreateNewGroupEntityPayload | CreateExistingGroupEntityPayload;
  new: CreateNewGroupEntityPayload;
  existing: CreateExistingGroupEntityPayload;
};

export type CreateGroupEntityPayload<
  T extends keyof CreateGroupEntityPayloadMap,
> = CreateGroupEntityPayloadMap[T];
