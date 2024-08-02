import { Optional } from '../../../../common/type/common-types';
import { CommentOwner } from '../comment-owner';

type CreateNewBaseCommentEntityPayload = {
  text: string;
  targetId: string;
};

type CreateExistingBaseCommentEntityPayload = {
  id: string;
  text: string;
  targetId: string;
  createdDateTime: Date;
  updatedDateTime?: Date;
  deletedDateTime?: Date;
};

type CreateBaseCommentEntityPayload = {
  all: CreateNewBaseCommentEntityPayload &
    CreateExistingBaseCommentEntityPayload;
  new: CreateNewBaseCommentEntityPayload;
  existing: CreateExistingBaseCommentEntityPayload;
};

type UserCommentAdditionalPayload = {
  owner: CommentOwner;
  tags: Optional<CommentOwner[]>;
};

type SystemCommentAdditionalPayload = {
  subText?: string;
};

type CommentAdditionalPayload = {
  base: {};
  user: UserCommentAdditionalPayload;
  system: SystemCommentAdditionalPayload;
};

export type CreateCommentEntityPayload<
  C extends keyof CommentAdditionalPayload,
  T extends keyof CreateBaseCommentEntityPayload,
> = CommentAdditionalPayload[C] & CreateBaseCommentEntityPayload[T];
