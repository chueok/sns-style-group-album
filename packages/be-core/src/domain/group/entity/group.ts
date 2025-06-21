import { z } from 'zod';

export const SGroup = z.object({
  id: z.string(),
  ownerId: z.string(),
  name: z.string(),
  createdDateTime: z.date(),
  updatedDateTime: z.date().optional(),
  deletedDateTime: z.date().optional(),
});
export type TGroup = z.infer<typeof SGroup>;

// 서버 내부에서 멤버 정보를 확인하기 위해 사용
export const SMember = z.object({
  id: z.string(),
  username: z.string(),
  profileImageUrl: z.string().optional(),
  role: z.enum(['owner', 'member']),
  joinRequestDateTime: z.date(),
  joinDateTime: z.date().optional(),
});
export type TMember = z.infer<typeof SMember>;

// 단순 프로필 정보만 가져오기 위해 사용
export const SMemberProfile = z.object({
  id: z.string(),
  username: z.string(),
  profileImageUrl: z.string().optional(),
});
export type TMemberProfile = z.infer<typeof SMemberProfile>;

// 가입 승인된 멤버 정보를 확인하기 위함
export const SAcceptedMember = SMember.extend({
  joinDateTime: z.date(),
});
export type TAcceptedMember = z.infer<typeof SAcceptedMember>;

// 가입신청한 멤버 정보를 확인하기 위함
export const SPendingMember = SMember.extend({
  joinDateTime: z.undefined(),
});

export type TPendingMember = z.infer<typeof SPendingMember>;
