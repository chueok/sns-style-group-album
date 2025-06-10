import { trpc } from '@/trpc/trpc';

export const useGroupList = () => {
  const { data } = trpc.group.getMyMemberGroups.useQuery();
  const groups = data?.items ?? [];
  return { groups };
};
