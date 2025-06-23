import { z } from 'zod';

export const SUser = z.object({
  id: z.string(),
  username: z.string(),
  email: z.string().email().nullable(),
  profileImageUrl: z.string().nullable(),

  createdDateTime: z.date(),
});

export type TUser = z.infer<typeof SUser>;
