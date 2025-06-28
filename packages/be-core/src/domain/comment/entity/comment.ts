import { ECommentCategory } from '../type/comment-category';
import { z } from 'zod';

export const SCommentTag = z.object({
  at: z.array(z.number()),
  memberId: z.string(),
});
export type TCommentTag = z.infer<typeof SCommentTag>;

export const SComment = z.object({
  id: z.string(),
  groupId: z.string(),
  category: z.nativeEnum(ECommentCategory),
  text: z.string(),
  tags: z.array(SCommentTag),
  contentId: z.string().optional(),
  ownerId: z.string().optional(),
  subText: z.string().optional(),
  createdDateTime: z.date(),
  updatedDateTime: z.date().optional(),
  deletedDateTime: z.date().optional(),
});
export type TComment = z.infer<typeof SComment>;

export const SUserComment = SComment.extend({
  contentId: z.string(),
  ownerId: z.string(),
  subText: z.undefined(),
});
export type TUserComment = z.infer<typeof SUserComment>;

export const SSystemComment = SComment.extend({
  contentId: z.undefined(),
  ownerId: z.undefined(),
});
export type TSystemComment = z.infer<typeof SSystemComment>;
