import { trpc } from '@/trpc/trpc';
import { useAuth } from '../auth/use-auth';

export const useJoinRequestUsers = (groupId?: string) => {
  const { user } = useAuth();

  const { data: joinRequestUsers = [], isLoading } =
    trpc.group.getJoinRequestUsers.useQuery(
      { groupId: groupId || '' },
      {
        staleTime: 1 * 60 * 1000,
        enabled: !!user && !!groupId,
      }
    );

  return { joinRequestUsers, isLoading };
};
