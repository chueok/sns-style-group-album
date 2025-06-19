import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import { Button } from '@repo/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@repo/ui/card';
import { formatDate } from '../utils/format-date';
import { useJoinRequestUsers } from '@/trpc/hooks/group/use-join-request-users';
import { useGroupStore } from '@/store/group-store';

const InvitationCard = ({
  username,
  profileImageUrl,
  createdDateTime,
}: {
  username: string;
  profileImageUrl?: string;
  createdDateTime: Date;
}) => {
  return (
    <Card className="tw-rounded-none">
      <CardHeader>
        <VisuallyHidden>
          <CardTitle>Invitation</CardTitle>
        </VisuallyHidden>
      </CardHeader>
      <CardContent className="tw-flex tw-flex-row tw-justify-between tw-gap-4">
        <div className="tw-shrink">
          🔔{username}님을 그룹1에 초대하시겠습니까?
        </div>
        <div className="tw-shrink-0 tw-text-foreground">
          {formatDate(createdDateTime)}
        </div>
      </CardContent>
      <CardFooter className="!tw-flex !tw-flex-row-reverse tw-gap-2">
        <Button className="tw-flex-1">수락</Button>
        <Button variant="outline" className="tw-flex-1">
          거절
        </Button>
      </CardFooter>
    </Card>
  );
};

const InnerFeedPage = ({ groupId }: { groupId: string }) => {
  const { joinRequestUsers, isLoading } = useJoinRequestUsers(groupId);
  return (
    <div>
      {joinRequestUsers?.map((requestingUser) => (
        <InvitationCard
          key={requestingUser.userId}
          username={requestingUser.username}
          profileImageUrl={requestingUser.profileImageUrl ?? undefined}
          createdDateTime={requestingUser.createdDateTime}
        />
      ))}
    </div>
  );
};

export const FeedPage = () => {
  const selectedGroupId = useGroupStore((state) => state.selectedGroupId);

  if (!selectedGroupId) {
    return null;
  }

  return <InnerFeedPage groupId={selectedGroupId} />;
};
