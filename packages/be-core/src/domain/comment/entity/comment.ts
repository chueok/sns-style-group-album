import { ECommentCategory } from '../enum/comment-category';
import { z } from 'zod';

export const SComment = z.object({
  id: z.string(),
  category: z.nativeEnum(ECommentCategory),
  text: z.string(),
  userTags: z.array(z.string()),
  contentId: z.string(),
  ownerId: z.string().nullable(),
  subText: z.string().nullable(),
  createdDateTime: z.date(),
  updatedDateTime: z.date().nullable(),
  deletedDateTime: z.date().nullable(),
});

export type TComment = z.infer<typeof SComment>;
