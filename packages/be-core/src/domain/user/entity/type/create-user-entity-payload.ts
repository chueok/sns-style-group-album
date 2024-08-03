import { IPasswordEncryptionService } from '../../../../infrastructure/security/encryption/password-encryption-service.interface';

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
  thumbnailRelativePath: string;

  id: string;
  createdDateTime: Date;
  updatedDateTime?: Date;
  deletedDateTime?: Date;
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
