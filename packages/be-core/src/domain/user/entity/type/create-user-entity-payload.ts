type CreateNewUserPayload = {
  username: string;
  hashedPassword: string;
  thumbnailRelativePath: string;
};

type CreateExistingUserPayload = {
  id: string;
  username: string;
  hashedPassword: string;
  thumbnailRelativePath: string;

  createdDateTime: Date;
  updatedDateTime?: Date;
  deletedDateTime?: Date;
};

export type CreateUserEntityPayload =
  | CreateNewUserPayload
  | CreateExistingUserPayload;
