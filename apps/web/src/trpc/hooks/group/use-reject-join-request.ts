import { trpc } from '@/trpc/trpc';

export const useRejectJoinRequest = () => {
  const { mutateAsync: rejectJoinRequest, isPending } =
    trpc.group.rejectJoinRequest.useMutation();

  return { rejectJoinRequest, isPending };
};
