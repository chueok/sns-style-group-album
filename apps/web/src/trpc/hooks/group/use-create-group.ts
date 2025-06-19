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

  const createGroup = async (name: string) => {
    return createGroupMutation({ name });
  };

  return { createGroup };
};
