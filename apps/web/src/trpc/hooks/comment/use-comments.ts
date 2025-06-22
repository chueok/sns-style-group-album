import { trpc } from '@/trpc/trpc';
import { useEffect } from 'react';

// TODO: 낙관적 업데이트 구현 필요
export const useCommentsOfContent = (contentId: string | undefined) => {
  const utils = trpc.useUtils();

  const { data, hasNextPage, fetchNextPage } =
    trpc.comment.getCommentsOfContent.useInfiniteQuery(
      {
        contentId: contentId || '',
        limit: 10,
        sortOrder: 'desc',
      },
      {
        enabled: !!contentId,
        getNextPageParam: (lastPage) => {
          return lastPage.nextCursor;
        },
      }
    );

  useEffect(() => {
    if (data?.pages.length) {
      data.pages.forEach((page) => {
        page.items.forEach((comment) => {
          const prevData = utils.comment.getComment.getData({
            commentId: comment.id,
          });
          if (!prevData) {
            utils.comment.getComment.setData(
              { commentId: comment.id },
              comment
            );
          }
        });
      });
    }
  }, [data?.pages, utils.comment.getComment, contentId]);

  const comments = data?.pages.flatMap((page) => page.items) || [];

  return { comments, hasNextPage, fetchNextPage: () => fetchNextPage() };
};

export const useCommentsOfGroup = (groupId: string) => {
  const utils = trpc.useUtils();

  const { data, hasNextPage, fetchNextPage } =
    trpc.comment.getCommentsOfGroup.useInfiniteQuery(
      {
        groupId,
        limit: 10,
        sortOrder: 'desc',
      },
      {
        enabled: !!groupId,
        getNextPageParam: (lastPage) => {
          return lastPage.nextCursor;
        },
      }
    );

  useEffect(() => {
    if (data?.pages) {
      data.pages.forEach((page) => {
        page.items.forEach((comment) => {
          const prevData = utils.comment.getComment.getData({
            commentId: comment.id,
          });
          if (!prevData) {
            utils.comment.getComment.setData(
              { commentId: comment.id },
              comment
            );
          }
        });
      });
    }
  }, [data?.pages, utils.comment.getComment, groupId]);

  const comments = data?.pages.flatMap((page) => page.items) || [];

  return { comments, hasNextPage, fetchNextPage: () => fetchNextPage() };
};

// TODO: useCommentOfContent, useCommentOfGroup에 의한 캐싱이 제대로 작동하지 않고 있음.
export const useComment = (commentId: string) => {
  const { data, isLoading } = trpc.comment.getComment.useQuery(
    { commentId },
    { staleTime: Infinity }
  );

  return { comment: data, isLoading };
};

export type TCommentTag = NonNullable<
  ReturnType<typeof useComment>['comment']
>['tags'][number];
