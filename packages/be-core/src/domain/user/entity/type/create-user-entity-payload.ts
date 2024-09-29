import { Nullable } from "../../../../common/type/common-types";
import { GroupId } from "../../../group/entity/type/group-id";
import { GroupInfo } from "../group-info";
import { UserGroupProfile } from "../user-group-profile";
import { UserId } from "./user-id";

type CommonCreateUserPayload = {
  username: string;
  email: Nullable<string>;
};

type CreateNewUserPayload = CommonCreateUserPayload & {};

type CreateExistingUserPayload = CommonCreateUserPayload & {
  id: UserId;

  hasProfileImage: boolean;

  groups: GroupId[];
  ownGroups: GroupId[];
  userGroupProfiles: UserGroupProfile[];
  invitedGroupList: GroupInfo[];

  createdDateTime: Date;
  updatedDateTime: Nullable<Date>;
  deletedDateTime: Nullable<Date>;
};

type CreateUserEntityPayloadMap = {
  all: CreateNewUserPayload | CreateExistingUserPayload;
  new: CreateNewUserPayload;
  existing: CreateExistingUserPayload;
};

export type CreateUserEntityPayload<
  T extends keyof CreateUserEntityPayloadMap,
> = CreateUserEntityPayloadMap[T];
