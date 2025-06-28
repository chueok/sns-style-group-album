import { z } from 'zod';

// NOTE: internal / external 구분 없이 사용 중
export const SGroup = z.object({
  id: z.string(),
  name: z.string(),
  createdDateTime: z.date(),
  updatedDateTime: z.date().optional(),
});
export type TGroup = z.infer<typeof SGroup>;

// 단순 프로필 정보만 가져오기 위해 사용
export const SUserProfile = z.object({
  userId: z.string(),
  username: z.string(),
  profileImageUrl: z.string().optional(),
});
export type TUserProfile = z.infer<typeof SUserProfile>;
