import { z } from 'zod';

export const SContentMember = z.object({
  id: z.string(),
  groupId: z.string(),
});

export type TContentMember = z.infer<typeof SContentMember>;
