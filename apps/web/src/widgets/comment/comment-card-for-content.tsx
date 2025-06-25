import { useComment } from '@/trpc/hooks/comment/use-comments';
import { MemberAvatar } from './member-avatar';
import { formatRelativeTime } from '../utils/format-date';
import { useMember } from '@/trpc/hooks/group/use-member';

export const UserCommentCardForContent = (props: { commentId: string }) => {
  const { commentId } = props;
  const { comment } = useComment(commentId);

  const { profile, isLoading, isError } = useMember({
    groupId: comment?.groupId,
    memberId: comment?.ownerId,
  });

  if (!comment || !comment.ownerId) {
    return null;
  }

  return (
    <div className="tw-flex tw-gap-4 tw-border tw-border-border tw-p-4 tw-align-top">
      <MemberAvatar memberId={comment.ownerId} />
      <div className="tw-flex-1">
        <div className="tw-bg-background tw-rounded-lg">
          <div className="tw-flex tw-items-center tw-justify-between tw-gap-2 tw-mb-1">
            <span className="tw-font-medium tw-text-sm">
              {profile?.username || 'Unknown'}
            </span>
            <span className="tw-text-xs tw-text-foreground">
              {formatRelativeTime(comment.createdDateTime)}
            </span>
          </div>
          <p className="tw-text-sm tw-text-foreground">{comment.text}</p>
        </div>
      </div>
    </div>
  );
};
