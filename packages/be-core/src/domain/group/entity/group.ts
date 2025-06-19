import { z } from 'zod';

export const SGroup = z.object({
  id: z.string(),
  ownerId: z.string(),
  name: z.string(),
  createdDateTime: z.date(),
  updatedDateTime: z.date().nullable(),
  deletedDateTime: z.date().nullable(),
});

export type TGroup = z.infer<typeof SGroup>;

export const SGroupMember = z.object({
  userId: z.string(),
  username: z.string(),
  profileImageUrl: z.string().nullable(),
});

export type TGroupMember = z.infer<typeof SGroupMember>;

export const SGroupJoinRequestUser = z.object({
  userId: z.string(),
  username: z.string(),
  profileImageUrl: z.string().nullable(),
  createdDateTime: z.date(),
});

export type TGroupJoinRequestUser = z.infer<typeof SGroupJoinRequestUser>;
