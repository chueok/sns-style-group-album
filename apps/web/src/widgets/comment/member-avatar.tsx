import { useGroupStore } from '@/store/group-store';
import { useMember } from '@/trpc/hooks/group/use-member';
import { Avatar, AvatarFallback, AvatarImage } from '@repo/ui/avatar';
import { User } from 'lucide-react';

export const MemberAvatar = ({ memberId }: { memberId: string }) => {
  const groupId = useGroupStore((state) => state.selectedGroupId);
  const { profile, isLoading, isError } = useMember({
    groupId,
    memberId,
  });

  return (
    <Avatar>
      <AvatarImage src={profile?.profileImageUrl} />
      <AvatarFallback>
        {profile?.username ? (
          profile.username.charAt(0).toUpperCase()
        ) : (
          <User className="h-4 w-4" />
        )}
      </AvatarFallback>
    </Avatar>
  );
};
