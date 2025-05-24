import z from 'zod';

export const SJwtUser = z.object({
  id: z.string(),
  username: z.string().optional(),
});

export type TJwtUser = z.infer<typeof SJwtUser>;
