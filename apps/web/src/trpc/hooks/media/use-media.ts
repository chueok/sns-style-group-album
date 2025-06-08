import { useGroupStore } from '@/store/group-store';
import { trpc } from '@/trpc/trpc';

// TODO: 낙관적 업데이트 구현 필요
export const useMedia = () => {
  const selectedGroupId = useGroupStore((state) => state.selectedGroupId);

  const { data, hasNextPage, fetchNextPage } =
    trpc.content.getGroupMedia.useInfiniteQuery(
      {
        groupId: selectedGroupId || '',
        limit: 20,
        sortOrder: 'desc',
      },
      {
        getNextPageParam: (lastPage) => {
          return lastPage.nextCursor;
        },
      }
    );

  const media = data?.pages.flatMap((page) => page.items) ?? [];

  return {
    media,
    hasNextPage,
    fetchNextPage: () => fetchNextPage(),
  };
};
