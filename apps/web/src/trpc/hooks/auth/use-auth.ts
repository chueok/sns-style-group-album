import { trpc } from '@/trpc/trpc';

export const useAuth = () => {
  const utils = trpc.useUtils();

  // cookie 보안 정책으로 인해, cookie를 통해 로그인 여부 확인하기가 어려움
  // 따라서 getMe를 통해 로그인 여부를 확인하고, 로그아웃 시 로그인 여부를 초기화함
  // TODO: 이후 store를 통해 username, isLogin 등을 관리하면 변경 필요.
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
