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
import { useCommentsOfGroup } from '@/trpc/hooks/comment/use-comments';
import { CommentCard, MediaCommentCard } from '../comment/comment-card';
import { useRef, useState } from 'react';
import { ScrollArea } from '@repo/ui/scroll-area';

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

const InnerFeedPage = ({ groupId }: { groupId: string }) => {
  const { joinRequestUsers, isLoading } = useJoinRequestUsers(groupId);
  const { comments } = useCommentsOfGroup(groupId);

  const lastContentId = useRef<string | undefined>(undefined);
  const visibleContentsSet = new Set();

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const scrollTop = e.currentTarget.scrollTop;
    const scrollHeight = e.currentTarget.scrollHeight;
    const clientHeight = e.currentTarget.clientHeight;
  };
  return (
    <div className="tw-w-full tw-h-full">
      <ScrollArea className="tw-w-full tw-h-full">
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
        {comments.flatMap((comment) => {
          const cards: JSX.Element[] = [];

          const isNewContent = comment.contentId !== lastContentId.current;
          const visibleContentId = lastContentId.current;
          lastContentId.current = comment.contentId;
          // 이전 컨텐츠 컨텍스트가 끝날 때 해당 컨텐츠 card를 보여줌
          if (isNewContent && visibleContentId) {
            if (!visibleContentsSet.has(visibleContentId)) {
              cards.push(
                <MediaCommentCard
                  key={visibleContentId}
                  mediaId={visibleContentId}
                />
              );
              visibleContentsSet.add(visibleContentId);
            } else {
              cards.push(
                <MediaCommentCard
                  key={visibleContentId}
                  mediaId={visibleContentId}
                  summary
                />
              );
            }
          }

          cards.push(<CommentCard key={comment.id} commentId={comment.id} />);
          return cards;
        })}
      </ScrollArea>
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
