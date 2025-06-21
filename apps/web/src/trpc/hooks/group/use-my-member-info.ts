import { trpc } from '@/trpc/trpc';

export const useMyMemberInfo = (groupId: string) => {
  const { data } = trpc.group.getMyMemberInfo.useQuery({ groupId });
  return data;
};
