import { trpc } from '@/trpc/trpc';

export const useApproveJoinRequest = () => {
  const utils = trpc.useUtils();

  const { mutateAsync: approveJoinRequest, isPending } =
    trpc.group.approveJoinRequest.useMutation({
      onSuccess: (_, { groupId }) => {
        utils.group.getJoinRequestUsers.invalidate({ groupId });
        utils.group.getMembersByGroupId.invalidate({ groupId });
      },
    });

  return {
    approveJoinRequest: (payload: { groupId: string; memberId: string }) => {
      return approveJoinRequest(payload);
    },
    isPending,
  };
};
