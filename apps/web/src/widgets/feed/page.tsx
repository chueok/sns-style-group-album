import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import { Button } from '@repo/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@repo/ui/card';
import { formatRelativeTime } from '../utils/format-date';
import { useJoinRequestUsers } from '@/trpc/hooks/group/use-join-request-users';
import { useGroupStore } from '@/store/group-store';
import { useApproveJoinRequest } from '@/trpc/hooks/group/use-approve-join-request';
import { Loader2 } from 'lucide-react';
import { useRejectJoinRequest } from '@/trpc/hooks/group/use-reject-join-request';
import {
  TCommentTag,
  useComment,
  useCommentsOfGroup,
} from '@/trpc/hooks/comment/use-comments';
import { useMember } from '@/trpc/hooks/group/use-member';

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
          {formatRelativeTime(requestedDateTime)}
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

const UserTag = ({ memberId }: { memberId: string }) => {
  const groupId = useGroupStore((state) => state.selectedGroupId);
  const { profile } = useMember({ groupId, memberId });

  return (
    <span className="tw-font-bold">{profile?.username || '알수없음'}</span>
  );
};

const TextWithTags = ({
  text,
  tags,
}: {
  text: string;
  tags: TCommentTag[];
}) => {
  const taggedText = tags
    .flatMap((tag) => {
      return tag.at.map((index) => {
        return {
          at: index,
          memberId: tag.memberId,
        };
      });
    })
    .sort((a, b) => a.at - b.at); // 내림차순

  let lastIndex = 0;
  const result: JSX.Element[] = [];
  while (taggedText.length > 0) {
    const tag = taggedText.pop();
    if (!tag) {
      break;
    }
    result.push(<span key={tag.at}>{text.slice(lastIndex, tag.at)}</span>);
    result.push(<UserTag key={tag.memberId} memberId={tag.memberId} />);
    lastIndex = tag.at;
  }
  result.push(<span key={-1}>{text.slice(lastIndex)}</span>);

  return <div>{result}</div>;
};

const FeedCommentCard = (props: { commentId: string }) => {
  const { comment, isLoading } = useComment(props.commentId);

  if (!comment) {
    return null;
  }

  return (
    <Card className="tw-rounded-none">
      <VisuallyHidden>
        <CardHeader>
          <CardTitle>{comment.text}</CardTitle>
        </CardHeader>
      </VisuallyHidden>
      <CardContent className="tw-flex tw-flex-row tw-justify-between tw-gap-4 !tw-p-4">
        <>
          <div className="tw-shrink">
            <TextWithTags text={comment.text} tags={comment.tags} />
          </div>
          <div className="tw-shrink-0 tw-text-foreground">
            {formatRelativeTime(comment.createdDateTime)}
          </div>
        </>
      </CardContent>
    </Card>
  );
};

const InnerFeedPage = ({ groupId }: { groupId: string }) => {
  const { joinRequestUsers, isLoading } = useJoinRequestUsers(groupId);
  const { comments } = useCommentsOfGroup(groupId);
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
      {comments.map((comment) => (
        <FeedCommentCard key={comment.id} commentId={comment.id} />
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
