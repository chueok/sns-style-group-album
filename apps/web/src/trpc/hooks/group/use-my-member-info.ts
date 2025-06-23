import { trpc } from '@/trpc/trpc';
import { useAuth } from '../auth/use-auth';

export const useMyMemberInfo = (groupId?: string) => {
  const { user } = useAuth();

  const { data, isLoading } = trpc.group.getMyMemberInfo.useQuery(
    { groupId: groupId || '' },
    {
      enabled: !!user && !!groupId,
    }
  );
  return { memberInfo: data, isLoading };
};
