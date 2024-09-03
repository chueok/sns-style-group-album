import { Nullable } from "../../../../common/type/common-types";
import { ContentId } from "../../../content/entity/type/content-id";
import { UserId } from "../../../user/entity/type/user-id";
import { CommentId } from "./comment-id";

type CreateNewBaseCommentEntityPayload = {
  text: string;
  contentId: ContentId;
};

type CreateExistingBaseCommentEntityPayload =
  CreateNewBaseCommentEntityPayload & {
    id: CommentId;
    userTags: UserId[];
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
  ownerId: UserId;
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
