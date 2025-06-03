import { trpc } from '@/trpc/trpc';

export const useCreateGroup = () => {
  const utils = trpc.useUtils();
  const { mutateAsync: createGroupMutation } =
    trpc.group.createGroup.useMutation({
      onSuccess: () => {
        utils.group.getMyMemberGroups.invalidate();
      },
    });

  const createGroup = async (name: string) => {
    return createGroupMutation({ name });
  };

  return { createGroup };
};
