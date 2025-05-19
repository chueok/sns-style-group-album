import z from 'zod';

/**
 * 소셜로 부터 받은 유저 프로필을 아래의 타입으로 파싱한다.
 */

export const SOauthUserProfile = z.object({
  provider: z.string(),
  providerId: z.string(),
  profileUrl: z.string().optional(),
  email: z.string().optional(),
});

export type TOauthUserProfile = z.infer<typeof SOauthUserProfile>;
