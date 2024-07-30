type CreateNewUserPayload = {
  username: string;
  password: string;
};

type CreateExistingUserPayload = {
  id: string;
  username: string;
  password: string;

  createdDateTime: Date;
  updatedDateTime?: Date;
  deletedDateTime?: Date;
};

export type CreateUserEntityPayload =
  | CreateNewUserPayload
  | CreateExistingUserPayload;
