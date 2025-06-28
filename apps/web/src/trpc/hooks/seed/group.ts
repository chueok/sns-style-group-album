import { trpc } from '@/trpc/trpc';

export const useCreateSeedGroup = () => {
  const {
    getGroups: { invalidate },
  } = trpc.useUtils().seed!;
  const { mutateAsync: createGroup, isPending } =
    trpc.seed!.createGroup.useMutation({
      onSuccess: () => {
        invalidate();
      },
    });
  return { createGroup, isPending };
};

export const useAddGroupMember = () => {
  const {
    getGroupMembers: { invalidate },
  } = trpc.useUtils().seed!;
  const { mutateAsync: addGroupMember, isPending } =
    trpc.seed!.addGroupMember.useMutation({
      onSuccess: () => {
        invalidate();
      },
    });
  return {
    addGroupMember: (payload: { groupId: string; userIdList: string[] }) => {
      return addGroupMember(payload);
    },
    isPending,
  };
};

export const useChangeGroupName = () => {
  const {
    getGroups: { invalidate },
  } = trpc.useUtils().seed!;
  const { mutateAsync: changeGroupName, isPending } =
    trpc.seed!.changeGroupName.useMutation({
      onSuccess: () => {
        invalidate();
      },
    });
  return { changeGroupName, isPending };
};

export const useDeleteGroup = () => {
  const {
    getGroups: { invalidate },
  } = trpc.useUtils().seed!;
  const { mutateAsync: deleteGroup, isPending } =
    trpc.seed!.deleteGroup.useMutation({
      onSuccess: () => {
        invalidate();
      },
    });
  return { deleteGroup, isPending };
};
