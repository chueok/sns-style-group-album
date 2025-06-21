import { trpc } from '@/trpc/trpc';

export const useJoinRequestUsers = (groupId: string) => {
  const { data: joinRequestUsers, isLoading } =
    trpc.group.getJoinRequestUsers.useQuery(
      { groupId },
      { staleTime: 1 * 60 * 1000 }
    );

  return { joinRequestUsers, isLoading };
};
