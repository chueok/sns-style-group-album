import { trpc } from '@/trpc/trpc';

export const useChangeGroupName = () => {
  const utils = trpc.useUtils();

  const { mutateAsync: changeGroupName, isPending } =
    trpc.group.changeGroupName.useMutation({
      onSuccess: (data) => {
        utils.group.getGroup.setData({ groupId: data.id }, data);
      },
    });

  return { changeGroupName, isPending };
};
