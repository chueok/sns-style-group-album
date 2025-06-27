import { Button } from '@repo/ui/button';
import { Heart, MessageCircle } from 'lucide-react';
import { formatDateToSlash, formatRelativeTime } from '../utils/format-date';
import { useMedia } from '@/trpc/hooks/media/use-media';
import { useMember } from '@/trpc/hooks/group/use-member';

export const ImageFooter = (props: {
  mediaId: string;
  relativeTime?: boolean;
}) => {
  const { relativeTime = false } = props;

  const { media } = useMedia({ mediaId: props.mediaId });
  const { profile } = useMember({
    groupId: media?.groupId,
    memberId: media?.ownerId,
  });

  if (!media) {
    return null;
  }
  const isLiked = false; // TODO: 추후 수정 필요
  const ownerUsername = profile?.username || '알수없음';

  return (
    <div className="tw-flex tw-items-center tw-justify-between tw-px-4">
      <div className="tw-flex tw-items-center tw-gap-4">
        <Button
          variant="ghost"
          size="icon"
          // onClick={handleLike}
          className={`tw-flex tw-items-center tw-gap-2 ${isLiked ? 'tw-text-red-500' : 'tw-text-gray-600'}`}
        >
          <Heart
            className={`tw-h-5 tw-w-5 ${isLiked ? 'tw-fill-current' : ''}`}
          />
          <span className="tw-font-medium">{media?.numLikes}</span>
        </Button>
        <div className="tw-flex tw-items-center tw-gap-2 tw-text-gray-600">
          <MessageCircle className="tw-h-5 tw-w-5" />
          <span className="tw-font-medium">{media?.numComments}</span>
        </div>
      </div>
      <div className="tw-text-sm tw-text-gray-500">
        {`@${ownerUsername} • ${relativeTime ? formatRelativeTime(media?.createdDateTime) : formatDateToSlash(media?.createdDateTime)}`}
      </div>
    </div>
  );
};
