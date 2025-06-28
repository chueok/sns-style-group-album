import { trpc } from '@/trpc/trpc';
import { useAuth } from '../auth/use-auth';

export const useInvitationCode = (groupId?: string) => {
  const { user } = useAuth();

  const { data, isLoading } = trpc.group.getInvitationCode.useQuery(
    {
      groupId: groupId || '',
    },
    {
      enabled: !!user && !!groupId,
    }
  );

  return { invitationCode: data, isLoading };
};
