import { useGroupStore } from '@/store/group-store';
import { trpc } from '@/trpc/trpc';
import { useAuth } from '../auth/use-auth';
import { useEffect, useState } from 'react';

// TODO: 낙관적 업데이트 구현 필요
export const useMediaList = (payload: { groupId?: string }) => {
  const utils = trpc.useUtils();

  const { user } = useAuth();

  const { data, hasNextPage, fetchNextPage } =
    trpc.content.getGroupMedia.useInfiniteQuery(
      {
        groupId: payload.groupId || '',
        limit: 20,
        sortOrder: 'desc',
      },
      {
        enabled: !!user && !!payload.groupId,

        getNextPageParam: (lastPage) => {
          return lastPage.nextCursor;
        },
      }
    );

  useEffect(() => {
    if (data?.pages.length) {
      data.pages.forEach((page) => {
        page.items.forEach((media) => {
          const prevData = utils.content.getMedia.getData({ id: media.id });
          if (!prevData) {
            utils.content.getMedia.setData({ id: media.id }, media);
          }
        });
      });
    }
  }, [data?.pages, utils.content.getMedia, payload.groupId]);

  const mediaList = data?.pages.flatMap((page) => page.items) ?? [];

  return {
    mediaList,
    hasNextPage,
    fetchNextPage: () => fetchNextPage(),
  };
};

export const useMedia = (payload: { mediaId: string }) => {
  const utils = trpc.useUtils();

  const [isEnabled, setIsEnabled] = useState(false);

  const { data, isLoading, isError } = trpc.content.getMedia.useQuery(
    { id: payload.mediaId },
    {
      staleTime: Infinity,
      enabled: isEnabled,
    }
  );

  useEffect(() => {
    const cachedData = utils.content.getMedia.getData({ id: payload.mediaId });
    if (!cachedData) {
      setIsEnabled(true);
    }
  }, [utils.content.getMedia, payload.mediaId]);

  return { media: data, isLoading, isError };
};
