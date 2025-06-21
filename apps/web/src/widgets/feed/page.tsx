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
import { useApproveJoinRequest } from '@/trpc/hooks/group/use-approve-join-request';
import { Loader2 } from 'lucide-react';
import { useRejectJoinRequest } from '@/trpc/hooks/group/use-reject-join-request';

const InvitationCard = ({
  username,
  profileImageUrl,
  requestedDateTime,
  groupId,
  memberId,
}: {
  username: string;
  profileImageUrl?: string;
  requestedDateTime: Date;
  groupId: string;
  memberId: string;
}) => {
  const { approveJoinRequest, isPending: isApprovePending } =
    useApproveJoinRequest();
  const { rejectJoinRequest, isPending: isRejecting } = useRejectJoinRequest();

  const handleApproveJoinRequest = (groupId: string, memberId: string) => {
    approveJoinRequest({ groupId, memberId });
  };

  const handleRejectJoinRequest = (groupId: string, memberId: string) => {
    rejectJoinRequest({ groupId, memberId });
  };

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
          {formatDate(requestedDateTime)}
        </div>
      </CardContent>
      <CardFooter className="!tw-flex !tw-flex-row-reverse tw-gap-2">
        <Button
          className="tw-flex-1"
          onClick={() => handleApproveJoinRequest(groupId, memberId)}
        >
          {isApprovePending ? <Loader2 className="tw-animate-spin" /> : null}
          수락
        </Button>
        <Button
          variant="outline"
          className="tw-flex-1"
          onClick={() => handleRejectJoinRequest(groupId, memberId)}
        >
          {isRejecting ? <Loader2 className="tw-animate-spin" /> : null}
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
          key={requestingUser.id}
          username={requestingUser.username}
          profileImageUrl={requestingUser.profileImageUrl ?? undefined}
          requestedDateTime={requestingUser.joinRequestDateTime}
          groupId={groupId}
          memberId={requestingUser.id}
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
