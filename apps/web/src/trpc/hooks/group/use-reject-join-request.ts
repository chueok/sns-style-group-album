import { trpc } from '@/trpc/trpc';

export const useRejectJoinRequest = () => {
  const utils = trpc.useUtils();
  const { mutateAsync: rejectJoinRequest, isPending } =
    trpc.group.rejectJoinRequest.useMutation({
      onSuccess: (_, { groupId }) => {
        utils.group.getJoinRequestUsers.invalidate({ groupId });
        utils.group.getMembersByGroupId.invalidate({ groupId });
      },
    });

  return {
    rejectJoinRequest: (payload: { groupId: string; memberId: string }) => {
      return rejectJoinRequest(payload);
    },
    isPending,
  };
};
