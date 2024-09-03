import { Nullable } from "../../../../common/type/common-types";
import { IPasswordEncryptionService } from "../../../encryption/password-encryption-service.interface";
import { UserId } from "./user-id";

type CommonCreateUserPayload = {
  username: string;
  thumbnailRelativePath: string;
};

type CreateNewUserPayload = CommonCreateUserPayload & {
  password: string;
  passwordEncryptionService: IPasswordEncryptionService;
};

type CreateNewUserPayloadForConstructor = CreateNewUserPayload & {
  hashedPassword: string;
};

type CreateExistingUserPayload = {
  username: string;
  hashedPassword: string;
  thumbnailRelativePath: Nullable<string>;

  id: UserId;
  createdDateTime: Date;
  updatedDateTime: Nullable<Date>;
  deletedDateTime: Nullable<Date>;
};

type CreateUserEntityPayloadMap = {
  all: CreateNewUserPayload | CreateExistingUserPayload;
  new: CreateNewUserPayload;
  existing: CreateExistingUserPayload;
  constructor: CreateNewUserPayloadForConstructor | CreateExistingUserPayload;
};

export type CreateUserEntityPayload<
  T extends keyof CreateUserEntityPayloadMap,
> = CreateUserEntityPayloadMap[T];
