import { z } from 'zod';

export const SSimpleGroupInfo = z.object({
  groupId: z.string(),
  name: z.string(),
  ownerId: z.string(),
  ownerUsername: z.string(),
});

export type TSimpleGroupInfo = z.infer<typeof SSimpleGroupInfo>;
