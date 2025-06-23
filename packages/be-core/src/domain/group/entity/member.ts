import z from 'zod';

export const SMemberRole = z.enum(['owner', 'member']);
export type TMemberRole = z.infer<typeof SMemberRole>;

export const SMemberStatus = z.enum([
  'pending',
  'approved',
  'rejected',
  'droppedOut',
  'left',
]);
export type TMemberStatus = z.infer<typeof SMemberStatus>;

// 서버 내부에서 멤버 정보를 확인하기 위해 사용
export const SMember = z.object({
  id: z.string(),
  groupId: z.string(),
  userId: z.string(),
  username: z.string(),
  profileImageUrl: z.string().optional(),
  role: SMemberRole,
  status: SMemberStatus,
  joinRequestDateTime: z.date(),
  joinDateTime: z.date().optional(),
});
export type TMember = z.infer<typeof SMember>;
