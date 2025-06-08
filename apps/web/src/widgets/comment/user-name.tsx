import { useGroupStore } from '@/store/group-store';
import { useMemberProfile } from '@/trpc/hooks/user/use-member-profile';

const InnerUserName = ({
  groupId,
  userId,
}: {
  groupId: string;
  userId: string;
}) => {
  const { profile, isLoading, isError } = useMemberProfile({
    groupId,
    userId,
  });

  return (
    <span className="tw-font-medium tw-text-sm">
      {profile?.username || 'Unknown'}
    </span>
  );
};

export const UserName = ({ userId }: { userId: string }) => {
  const groupId = useGroupStore((state) => state.selectedGroupId);
  if (!groupId) {
    return <span className="tw-font-bold tw-text-sm">Unknown</span>;
  }

  return <InnerUserName groupId={groupId} userId={userId} />;
};
