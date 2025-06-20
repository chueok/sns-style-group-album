import { trpc } from '@/trpc/trpc';
import { useEffect } from 'react';

export const useJoinRequestUsers = (groupId: string) => {
  const utils = trpc.useUtils();

  const { data: joinRequestUsers, isLoading } =
    trpc.group.getJoinRequestUsers.useQuery(
      { groupId },
      { staleTime: 1 * 60 * 1000 }
    );

  useEffect(() => {
    if (joinRequestUsers) {
      joinRequestUsers.forEach((user) => {
        const { requestedDateTime: _, ...memberProfile } = user;
        utils.user.getMemberProfile.setData(
          { groupId, userId: user.id },
          memberProfile
        );
      });
    }
  }, [joinRequestUsers, groupId, utils.user.getMemberProfile]);

  return { joinRequestUsers, isLoading };
};
