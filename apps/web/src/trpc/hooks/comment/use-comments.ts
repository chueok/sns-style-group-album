import { trpc } from '@/trpc/trpc';

// TODO: 낙관적 업데이트 구현 필요
export const useComments = (contentId: string) => {
  const { data, hasNextPage, fetchNextPage } =
    trpc.comment.getCommentsOfContent.useInfiniteQuery(
      {
        contentId: contentId,
        limit: 10,
        sortOrder: 'desc',
      },
      {
        getNextPageParam: (lastPage) => {
          return lastPage.nextCursor;
        },
      }
    );

  const comments = data?.pages.flatMap((page) => page.items) || [];

  return { comments, hasNextPage, fetchNextPage: () => fetchNextPage() };
};
