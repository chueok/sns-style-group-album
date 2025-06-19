import { trpc } from '@/trpc/trpc';

export const useInvitationCode = (groupId: string) => {
  const { data, isLoading } = trpc.group.getInvitationCode.useQuery({
    groupId,
  });

  return { invitationCode: data, isLoading };
};
