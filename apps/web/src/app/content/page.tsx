'use client';

import { useContentStore } from '@/store/content-store';
import { trpc } from '@/trpc/trpc';
import { Button } from '@repo/ui/button';
import {
  ChevronLeft,
  Download,
  Heart,
  MessageCircle,
  Send,
  Share2,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@repo/ui/dropdown-menu';
import { MoreVertical } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { Separator } from '@repo/ui/separator';
import { Textarea } from '@repo/ui/textarea';
import React, { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAddComment } from '@/trpc/hooks/comment/use-add-comment';
import { useCommentsOfContent } from '@/trpc/hooks/comment/use-comments';
import { MemberAvatar } from '@/widgets/comment/member-avatar';
import { useGroupStore } from '@/store/group-store';
import { ScrollArea } from '@repo/ui/scroll-area';
import { useSwipeGesture } from '@/widgets/common/use-swipe-gesture';
import { useMyMemberInfo } from '@/trpc/hooks/group/use-my-member-info';
import { formatDateToSlash } from '@/widgets/utils/format-date';
import { useMember } from '@/trpc/hooks/group/use-member';
import { MemberCommentCard } from '@/widgets/comment/comment-card';
import { ImageContainer } from '@/widgets/content/image-container';
import { ImageFooter } from '@/widgets/content/image-footer';

const CommentList = (payload: { contentId: string }) => {
  const { contentId } = payload;
  const { comments } = useCommentsOfContent(contentId);

  return (
    <ScrollArea className="tw-h-full">
      {comments.map((comment) => {
        return <MemberCommentCard key={comment.id} commentId={comment.id} />;
      })}
    </ScrollArea>
  );
};

const AddComment = (payload: { contentId: string }) => {
  const { contentId } = payload;
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const groupId = useGroupStore((state) => state.selectedGroupId);
  const { memberInfo } = useMyMemberInfo(groupId);
  const [newComment, setNewComment] = useState('');

  const { addComment, isPending } = useAddComment();

  const handleAddComment = async () => {
    if (!contentId || isPending || !newComment.trim()) {
      return;
    }
    await addComment({
      contentId,
      text: newComment,
    });
    setNewComment('');
    setTimeout(() => {
      textareaRef.current?.focus(); // 렌더링이 완료 된 이후 포커스 처리
    }, 0);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleAddComment();
    }
  };

  if (!memberInfo) {
    return null;
  }

  return (
    <div className="tw-flex tw-gap-3">
      <MemberAvatar memberId={memberInfo.id} />
      <div className="tw-flex-1 tw-flex tw-gap-2">
        <Textarea
          ref={textareaRef}
          placeholder="Add a comment..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          className="tw-min-h-[40px] tw-resize-none"
          onKeyDown={handleKeyDown}
          disabled={isPending}
        />
        <Button
          onClick={handleAddComment}
          disabled={!newComment.trim() || isPending}
          size="sm"
        >
          <Send className="tw-h-4 tw-w-4" />
        </Button>
      </div>
    </div>
  );
};

export default function ContentPage() {
  const searchParams = useSearchParams();
  const contentId = searchParams.get('id');
  const { selectedContentId, setSelectedContentId } = useContentStore();
  const router = useRouter();

  const { data: media } = trpc.content.getMedia.useQuery({
    id: contentId || '',
  });

  const { profile } = useMember({
    groupId: media?.groupId || '',
    memberId: media?.ownerId || '',
  });

  if (contentId !== selectedContentId) {
    setSelectedContentId(contentId);
  }

  const setSelectedGroupId = useGroupStore((state) => state.setSelectedGroupId);
  useEffect(() => {
    if (media?.groupId) {
      setSelectedGroupId(media.groupId);
    }
  }, [media?.groupId, setSelectedGroupId]);

  const isLiked = false;

  /**
   * header, image footer, add comment, separator 높이 계산
   */
  const headerContainerRef = useRef<HTMLDivElement>(null);
  const headerHeight = headerContainerRef.current?.clientHeight || 0;

  const imageFooterContainerRef = useRef<HTMLDivElement>(null);
  const imageFooterHeight = imageFooterContainerRef.current?.clientHeight || 0;

  const addCommentContainerRef = useRef<HTMLDivElement>(null);
  const addCommentHeight = addCommentContainerRef.current?.clientHeight || 0;

  const separatorHeight = 8;

  /**
   * 이미지 컨테이너 높이 계산
   */
  const imageContainerRef = useRef<HTMLDivElement>(null);
  const [imageHeight, setImageHeight] = useState(0);
  useEffect(() => {
    if (!imageContainerRef.current) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setImageHeight(entry.contentRect.height);
      }
    });

    resizeObserver.observe(imageContainerRef.current);

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  /**
   * swipe, wheel 이벤트 핸들러
   */
  const [isFullImage, setIsFullImage] = useState(true);
  const handleOnWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    e.stopPropagation();
    if (!imageContainerRef.current) return;

    const isDown = e.deltaY > 1;
    const isUp = e.deltaY < -1;

    if (isDown) {
      setIsFullImage(false);
    } else if (isUp) {
      setIsFullImage(true);
    }
  };
  const swipeHandlers = useSwipeGesture({
    horizontalThreshold: 100,
    verticalThreshold: 100,
    cancelHorizontalThreshold: 100,
    cancelVerticalThreshold: 100,
    onVerticalSwipe: (direction) => {
      if (direction === 'up') {
        setIsFullImage(false);
      } else if (direction === 'down') {
        setIsFullImage(true);
      }
    },
  });

  if (!media) {
    return 'media not found'; // TODO: 추후 redirect 처리 필요
  }

  // TODO: 이미지 크기 변경 시 애니메이션 구현 필요
  return (
    <div className="tw-h-screen tw-mx-auto tw-overflow-hidden">
      {/* Header */}
      <div
        ref={headerContainerRef}
        className="tw-flex tw-items-center tw-justify-between"
      >
        <Button
          variant="ghost"
          size="icon"
          onClick={() => {
            router.back();
          }}
        >
          <ChevronLeft className="tw-h-5 tw-w-5" />
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreVertical className="tw-h-5 tw-w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>
              <Download className="tw-h-4 tw-w-4 tw-mr-2" />
              Download
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Share2 className="tw-h-4 tw-w-4 tw-mr-2" />
              Share
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Main Image Display */}
      <div
        ref={imageContainerRef}
        onWheel={handleOnWheel}
        {...swipeHandlers}
        data-full={isFullImage}
        className="tw-h-[calc(100%-40px)] tw-w-full tw-overflow-hidden data-[full=false]:tw-aspect-square data-[full=false]:tw-h-auto"
      >
        {media?.originalUrl && (
          <ImageContainer imageUrl={media.originalUrl} full={isFullImage} />
        )}
      </div>

      {/* Like and Comment Stats */}
      <div ref={imageFooterContainerRef}>
        <ImageFooter mediaId={media?.id} />
      </div>

      {/* Comments List */}
      {contentId && (
        <div
          className="tw-bg-background"
          style={{
            height: `calc(100% - ${imageHeight + headerHeight + imageFooterHeight}px)`,
          }}
        >
          <Separator
            className="!tw-m-0 tw-bg-border"
            style={{
              height: `${separatorHeight}px`,
            }}
          />
          <div
            className="tw-h-[calc(100%-8px)]"
            style={{
              height: `calc(100% - ${addCommentHeight + separatorHeight}px)`,
            }}
          >
            <CommentList contentId={contentId} />
          </div>

          {/* Add Comment */}

          <div ref={addCommentContainerRef} className="tw-p-4">
            <AddComment contentId={contentId} />
          </div>
        </div>
      )}
    </div>
  );
}
