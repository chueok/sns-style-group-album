import { useGroupStore } from '@/store/group-store';
import { trpc } from '@/trpc/trpc';

export const useMedia = () => {
  const selectedGroupId = useGroupStore((state) => state.selectedGroupId);

  const { data: media } = trpc.content.getGroupMedia.useQuery({
    groupId: selectedGroupId || '',
    pagination: {
      limit: 100,
      sortField: 'createdDateTime',
      sortOrder: 'desc',
    },
  });

  return { media };
};
