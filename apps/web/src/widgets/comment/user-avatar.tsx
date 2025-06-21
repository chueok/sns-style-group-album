import { useGroupStore } from '@/store/group-store';
import { useMember } from '@/trpc/hooks/group/use-member';
import { Avatar, AvatarFallback, AvatarImage } from '@repo/ui/avatar';
import { User } from 'lucide-react';

const InnerUserAvatar = ({
  groupId,
  userId,
}: {
  groupId: string;
  userId: string;
}) => {
  const { profile, isLoading, isError } = useMember({
    groupId,
    userId,
  });

  return (
    <Avatar>
      <AvatarImage src={profile?.profileImageUrl || undefined} />
      {profile?.username ? (
        <AvatarFallback>
          {profile.username.charAt(0).toUpperCase()}
        </AvatarFallback>
      ) : (
        <AvatarFallback>
          <User className="h-4 w-4" />
        </AvatarFallback>
      )}
    </Avatar>
  );
};

// groupId가 없을 때 서버 호출을 막기 위해 InnerUserAvatar를 따로 구현.
export const UserAvatar = ({ userId }: { userId: string }) => {
  const groupId = useGroupStore((state) => state.selectedGroupId);

  if (!groupId) {
    return (
      <Avatar>
        <AvatarFallback>
          <User className="h-4 w-4" />
        </AvatarFallback>
      </Avatar>
    );
  }

  return <InnerUserAvatar groupId={groupId} userId={userId} />;
};
