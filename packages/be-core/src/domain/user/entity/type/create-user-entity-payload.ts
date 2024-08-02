type CreateNewUserPayload = {
  username: string;
  hashedPassword: string;
  thumbnailRelativePath: string;
};

type CreateExistingUserPayload = CreateNewUserPayload & {
  id: string;

  createdDateTime: Date;
  updatedDateTime?: Date;
  deletedDateTime?: Date;
};

type CreateUserEntityPayloadMap = {
  all: CreateNewUserPayload | CreateExistingUserPayload;
  new: CreateNewUserPayload;
  existing: CreateExistingUserPayload;
};

export type CreateUserEntityPayload<
  T extends keyof CreateUserEntityPayloadMap,
> = CreateUserEntityPayloadMap[T];
