import { trpc } from '@/trpc/trpc';

export const useMyMemberInfo = (groupId: string | null) => {
  const { data } = trpc.group.getMyMemberInfo.useQuery(
    { groupId: groupId || '' },
    {
      enabled: !!groupId,
    }
  );
  return data;
};
