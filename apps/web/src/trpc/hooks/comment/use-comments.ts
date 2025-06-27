import { trpc } from '@/trpc/trpc';
import { useEffect, useState } from 'react';
import { useAuth } from '../auth/use-auth';

// TODO: 낙관적 업데이트 구현 필요
export const useCommentsOfContent = (contentId?: string) => {
  const { user } = useAuth();
  const utils = trpc.useUtils();

  const { data, hasNextPage, fetchNextPage } =
    trpc.comment.getCommentsOfContent.useInfiniteQuery(
      {
        contentId: contentId || '',
        limit: 10,
        sortOrder: 'desc',
      },
      {
        enabled: !!user && !!contentId,
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

export const useCommentsOfGroup = (groupId?: string) => {
  const { user } = useAuth();
  const utils = trpc.useUtils();

  const { data, hasNextPage, fetchNextPage } =
    trpc.comment.getCommentsOfGroup.useInfiniteQuery(
      {
        groupId: groupId || '',
        limit: 10,
        sortOrder: 'desc',
      },
      {
        enabled: !!user && !!groupId,
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

/**
 * useCommentsOfXXX 에서 cache가 완료 된 이후,
 * 필요 시 서버 호출을 하기 위해서 useEffect 내부에서 캐시 여부를 확인하고 호출하는 형태로 구현
 * 그렇지 않을 경우 useCommentsOfXXX의 useEffect가 실행되기 전에 서버 호출이 발생하여 비효율적인 호출이 발생 함.
 */
export const useComment = (commentId: string) => {
  const utils = trpc.useUtils();

  const [isEnabled, setIsEnabled] = useState(false);

  const { data, isLoading } = trpc.comment.getComment.useQuery(
    { commentId },
    {
      staleTime: Infinity,
      enabled: isEnabled,
    }
  );

  useEffect(() => {
    const cachedData = utils.comment.getComment.getData({ commentId });
    if (!cachedData) {
      setIsEnabled(true);
    }
  }, [utils.comment.getComment, commentId]);

  return { comment: data, isLoading };
};

export type TCommentTag = NonNullable<
  ReturnType<typeof useComment>['comment']
>['tags'][number];
