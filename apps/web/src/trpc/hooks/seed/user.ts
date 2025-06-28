import { trpc } from '@/trpc/trpc';

export const useCreateSeedUser = () => {
  const trpcUtils = trpc.useUtils();

  const { mutateAsync: createUser, isPending } =
    trpc.seed!.createUser.useMutation({
      onSuccess: () => {
        trpcUtils.seed!.getUsers.invalidate();
        trpcUtils.user.getMe.invalidate();
      },
    });
  return { createUser, isPending };
};

export const useDeleteSeedUser = () => {
  const trpcUtils = trpc.useUtils();
  const { mutateAsync: deleteUser, isPending } =
    trpc.seed!.deleteUser.useMutation({
      onSuccess: () => {
        trpcUtils.seed!.getUsers.invalidate();
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

export const useSeedLogin = () => {
  const trpcUtils = trpc.useUtils();
  const { mutateAsync: login, isPending } = trpc.seed!.login.useMutation({
    onSuccess: () => {
      trpcUtils.user.getMe.invalidate();
    },
  });
  return { login, isPending };
};
