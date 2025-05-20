import z from 'zod';

export const SJwtRefreshPayload = z.object({
  userId: z.string(),
  type: z.literal('refresh'),
});

export type TRefreshJwtPayload = z.infer<typeof SJwtRefreshPayload>;
