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
