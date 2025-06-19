import { trpc } from '@/trpc/trpc';

export const useJoinRequestUsers = (groupId: string) => {
  const { data: joinRequestUsers, isLoading } =
    trpc.group.getJoinRequestUsers.useQuery({ groupId });

  return { joinRequestUsers, isLoading };
};
