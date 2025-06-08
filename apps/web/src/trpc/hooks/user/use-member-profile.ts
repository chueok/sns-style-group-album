import { trpc } from '../../trpc';

export const useMemberProfile = (payload: {
  groupId: string;
  userId: string;
}) => {
  const {
    data: profile,
    isLoading,
    isError,
  } = trpc.user.getMemberProfile.useQuery(payload);

  return {
    profile,
    isLoading,
    isError,
  };
};
