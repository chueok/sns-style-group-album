import { z } from 'zod';
import { SMemberRole } from '../entity/member';

export const SMemberDTO = z.object({
  id: z.string(),
  username: z.string(),
  profileImageUrl: z.string().optional(),
  role: SMemberRole,
  joinRequestDateTime: z.date(),
  joinDateTime: z.date().optional(),
});
export type TMemberDTO = z.infer<typeof SMemberDTO>;

// 가입 승인된 멤버 정보를 확인하기 위함
export const SAcceptedMemberDTO = SMemberDTO.extend({
  joinDateTime: z.date(),
});
export type TAcceptedMemberDTO = z.infer<typeof SAcceptedMemberDTO>;

// 가입신청한 멤버 정보를 확인하기 위함
export const SPendingMemberDTO = SMemberDTO.extend({
  joinDateTime: z.undefined(),
});

export type TPendingMemberDTO = z.infer<typeof SPendingMemberDTO>;
