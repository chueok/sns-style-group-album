import { z } from 'zod';

export const SGroupProfile = z.object({
  groupId: z.string(),
  username: z.string(),
  profileImageUrl: z.string().nullable(),
});

export type TGroupProfile = z.infer<typeof SGroupProfile>;
