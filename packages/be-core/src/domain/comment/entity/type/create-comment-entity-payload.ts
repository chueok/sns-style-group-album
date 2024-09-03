import { Nullable } from "../../../../common/type/common-types";

type CreateNewBaseCommentEntityPayload = {
  text: string;
  contentId: string;
};

type CreateExistingBaseCommentEntityPayload =
  CreateNewBaseCommentEntityPayload & {
    id: string;
    userTags: string[];
    createdDateTime: Date;
    updatedDateTime: Nullable<Date>;
    deletedDateTime: Nullable<Date>;
  };

type CreateBaseCommentEntityPayload = {
  all:
    | CreateNewBaseCommentEntityPayload
    | CreateExistingBaseCommentEntityPayload;
  new: CreateNewBaseCommentEntityPayload;
  existing: CreateExistingBaseCommentEntityPayload;
};

type UserCommentAdditionalPayload = {
  ownerId: string;
};

type SystemCommentAdditionalPayload = {
  subText: Nullable<string>;
};

type CommentAdditionalPayload = {
  base: object;
  user: UserCommentAdditionalPayload;
  system: SystemCommentAdditionalPayload;
};

export type CreateCommentEntityPayload<
  C extends keyof CommentAdditionalPayload,
  T extends keyof CreateBaseCommentEntityPayload,
> = CommentAdditionalPayload[C] & CreateBaseCommentEntityPayload[T];
