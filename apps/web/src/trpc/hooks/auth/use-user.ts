import { trpc } from '@/trpc/trpc';

export const useAuth = () => {
  const { data: user } = trpc.auth.getMe.useQuery(undefined, {
    gcTime: Infinity,
    staleTime: Infinity,
  });

  return { user };
};
