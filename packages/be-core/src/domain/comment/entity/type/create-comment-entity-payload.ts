import { Nullable } from "../../../../common/type/common-types";
import { CommentUser } from "../comment-user";

type CreateNewBaseCommentEntityPayload = {
  text: string;
  contentId: string;
  contentThumbnailRelativePath: Nullable<string>;
};

type CreateExistingBaseCommentEntityPayload =
  CreateNewBaseCommentEntityPayload & {
    id: string;
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
  owner: CommentUser;
  tags: CommentUser[];
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
