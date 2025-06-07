'use client';

import { useContentStore } from '@/store/content-store';
import { trpc } from '@/trpc/trpc';
import { Button } from '@repo/ui/button';
import {
  ChevronLeft,
  Download,
  Heart,
  MessageCircle,
  Share2,
  User,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@repo/ui/dropdown-menu';
import { MoreVertical } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent } from '@repo/ui/card';
import { Separator } from '@repo/ui/separator';
import { Avatar, AvatarFallback } from '@repo/ui/avatar';
import { Textarea } from '@repo/ui/textarea';

export default function ContentPage() {
  const searchParams = useSearchParams();
  const contentId = searchParams.get('id');
  const { selectedContentId, setSelectedContentId } = useContentStore();

  const { data: media } = trpc.content.getMedia.useQuery({
    id: contentId || '',
  });

  if (contentId !== selectedContentId) {
    setSelectedContentId(contentId);
  }

  const isLiked = false;

  return (
    <div className="tw-min-h-screen tw-py-4">
      <div className="tw-mx-auto">
        {/* Header */}
        <div className="tw-flex tw-items-center tw-justify-between tw-mb-6">
          <Button variant="ghost" size="icon">
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

        <Card className="tw-overflow-hidden tw-rounded-none">
          <CardContent className="tw-p-0">
            {/* Main Image Display */}
            <div className="tw-aspect-auto tw-overflow-hidden tw-rounded-none tw-w-full">
              <img
                src={media?.originalUrl}
                className="tw-w-full tw-h-full tw-object-cover"
              />
            </div>

            {/* Interaction Section */}
            <div className="tw-bg-white tw-p-4">
              {/* Like and Comment Stats */}
              <div className="tw-flex tw-items-center tw-justify-between tw-mb-4">
                <div className="tw-flex tw-items-center tw-gap-4">
                  <Button
                    variant="ghost"
                    size="sm"
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
                  @photographer • 2024/01/15
                </div>
              </div>
              {/* <Separator className="mb-4" />

              Add Comment
              <div className="mb-6">
                <div className="flex gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>
                      <User className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 flex gap-2">
                    <Textarea
                      placeholder="Add a comment..."
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      className="min-h-[40px] resize-none"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleAddComment();
                        }
                      }}
                    />
                    <Button
                      onClick={handleAddComment}
                      disabled={!newComment.trim()}
                      size="sm"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              Comments List
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900">Comments</h3>
                {comments.map((comment) => (
                  <div key={comment.id} className="flex gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>{comment.user.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="bg-gray-50 rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-sm">
                            {comment.user}
                          </span>
                          <span className="text-xs text-gray-500">
                            {comment.timestamp}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700">{comment.text}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div> */}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
