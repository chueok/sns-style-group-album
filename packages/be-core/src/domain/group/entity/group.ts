import { z } from 'zod';

// NOTE: internal / external 구분 없이 사용 중
export const SGroup = z.object({
  id: z.string(),
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
export const SUserProfile = z.object({
  userId: z.string(),
  username: z.string(),
  profileImageUrl: z.string().optional(),
});
export type TUserProfile = z.infer<typeof SUserProfile>;
