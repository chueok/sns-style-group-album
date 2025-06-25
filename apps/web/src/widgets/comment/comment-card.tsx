import { TCommentTag, useComment } from '@/trpc/hooks/comment/use-comments';
import { MemberAvatar } from './member-avatar';
import { formatRelativeTime } from '../utils/format-date';
import { useMember } from '@/trpc/hooks/group/use-member';
import { useGroupStore } from '@/store/group-store';

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

export const MemberCommentCard = (props: { commentId: string }) => {
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

export const SystemCommentCard = (props: { commentId: string }) => {
  const { commentId } = props;
  const { comment } = useComment(commentId);

  if (!comment) {
    return null;
  }

  return (
    <>
      <div className="tw-flex tw-gap-4 tw-border tw-border-border tw-p-4 tw-align-top">
        <div className="tw-flex-1">
          <div className="tw-bg-background tw-rounded-lg">
            <div className="tw-flex tw-items-center tw-justify-between tw-gap-2">
              <span className="tw-font-medium tw-text-sm">
                <TextWithTags text={comment.text} tags={comment.tags} />
              </span>
              <span className="tw-text-xs tw-text-foreground">
                {formatRelativeTime(comment.createdDateTime)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export const CommentCard = (props: { commentId: string }) => {
  const { commentId } = props;
  const { comment } = useComment(commentId);

  if (!comment) {
    return null;
  }

  if (comment.category === 'user-comment') {
    return <MemberCommentCard commentId={commentId} />;
  } else {
    return <SystemCommentCard commentId={commentId} />;
  }
};
