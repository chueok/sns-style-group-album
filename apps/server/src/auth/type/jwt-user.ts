import z from 'zod';

export const SJwtUser = z.object({
  id: z.string(),
});

export type TJwtUser = z.infer<typeof SJwtUser>;
