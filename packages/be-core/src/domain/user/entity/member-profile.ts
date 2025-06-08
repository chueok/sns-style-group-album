import { z } from 'zod';

// user profile 정보만을 전달하기 위해 사용
export const SMemberProfile = z.object({
  id: z.string(),
  username: z.string(),
  profileImageUrl: z.string().nullable(),
});

export type TMemberProfile = z.infer<typeof SMemberProfile>;
