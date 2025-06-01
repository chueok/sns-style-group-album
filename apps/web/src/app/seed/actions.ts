import { trpc } from '@/trpc/trpc';

export const useCreateSeedUser = () => {
  const {
    getUsers: { invalidate: invalidateGetUsers },
  } = trpc.useUtils().seed!;

  const { mutateAsync: createUser, isPending } =
    trpc.seed!.createUser.useMutation({
      onSuccess: () => {
        invalidateGetUsers();
      },
    });
  return { createUser, isPending };
};

export const useDeleteSeedUser = () => {
  const {
    getUsers: { invalidate: invalidateGetUsers },
  } = trpc.useUtils().seed!;
  const { mutateAsync: deleteUser, isPending } =
    trpc.seed!.deleteUser.useMutation({
      onSuccess: () => {
        invalidateGetUsers();
      },
    });
  return { deleteUser, isPending };
};

export const useChangeUsername = () => {
  const {
    getUsers: { invalidate: invalidateGetUsers },
  } = trpc.useUtils().seed!;
  const { mutateAsync: changeUsername, isPending } =
    trpc.seed!.changeUsername.useMutation({
      onSuccess: () => {
        invalidateGetUsers();
      },
    });

  return { changeUsername, isPending };
};

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
  return { addGroupMember, isPending };
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
