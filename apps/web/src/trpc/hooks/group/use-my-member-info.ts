import { trpc } from '@/trpc/trpc';

export const useMyMemberInfo = (groupId: string | undefined) => {
  const { data, isLoading } = trpc.group.getMyMemberInfo.useQuery(
    { groupId: groupId || '' },
    {
      enabled: !!groupId,
    }
  );
  return { memberInfo: data, isLoading };
};
