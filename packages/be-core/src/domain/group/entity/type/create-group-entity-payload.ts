import { Nullable } from '../../../../common/type/common-types';
import { UserId } from '../../../user/entity/type/user-id';
import { GroupId } from './group-id';

type CreateNewGroupEntityPayload = {
  ownerId: UserId;
  name: string;
};

type CreateExistingGroupEntityPayload = CreateNewGroupEntityPayload & {
  id: GroupId;
  createdDateTime: Date;
  members: UserId[];
  invitedUserList: UserId[];
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
