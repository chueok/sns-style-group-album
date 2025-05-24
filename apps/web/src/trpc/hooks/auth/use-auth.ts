import { trpc } from '@/trpc/trpc';

export const useAuth = () => {
  const utils = trpc.useUtils();

  const { data: user } = trpc.auth.getMe.useQuery(undefined, {
    gcTime: Infinity,
    staleTime: Infinity,
  });

  const { mutateAsync: logoutMutation } = trpc.auth.logout.useMutation({
    onSuccess: () => {
      utils.auth.getMe.invalidate();
    },
    onError: (error) => {
      console.error('Logout failed:', error);
    },
  });

  const logout = async () => {
    if (!user) {
      return;
    }
    return logoutMutation();
  };

  return { user, logout };
};
