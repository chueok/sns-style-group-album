import { trpc } from '@/trpc/trpc';

export const useCreateGroup = () => {
  const utils = trpc.useUtils();
  const { mutateAsync: createGroupMutation } =
    trpc.group.createGroup.useMutation({
      onSuccess: (data) => {
        utils.group.getMyMemberGroups.invalidate();
        utils.group.getGroup.setData({ groupId: data.id }, data);
      },
    });

  const createGroup = async (payload: { name: string }) => {
    return createGroupMutation(payload);
  };

  return { createGroup };
};
