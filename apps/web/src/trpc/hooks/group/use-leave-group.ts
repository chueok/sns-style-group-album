import { trpc } from '@/trpc/trpc';

export const useLeaveGroup = () => {
  const { mutateAsync: leaveGroup, isPending } =
    trpc.group.leaveGroup.useMutation();

  return {
    leaveGroup: (payload: { groupId: string }) => {
      return leaveGroup(payload);
    },
    isPending,
  };
};
