import { z } from 'zod';

export const SCommentMember = z.object({
  id: z.string(),
  groupId: z.string(),
  username: z.string(),
  profileImageUrl: z.string().nullable(),
});

export type TCommentMember = z.infer<typeof SCommentMember>;
