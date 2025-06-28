import { trpc } from '@/trpc/trpc';

export const useRequestJoinGroup = () => {
  const { mutate: requestJoinGroup, isPending } =
    trpc.group.requestJoinGroup.useMutation();

  return {
    requestJoinGroup: (payload: { invitationCode: string }) => {
      return requestJoinGroup(payload);
    },
    isPending,
  };
};
