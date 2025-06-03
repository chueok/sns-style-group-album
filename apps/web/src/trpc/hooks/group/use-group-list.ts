import { trpc } from '@/trpc/trpc';

export const useGroupList = () => {
  const { data: groups } = trpc.group.getMyMemberGroups.useQuery();
  return groups?.items ?? [];
};
