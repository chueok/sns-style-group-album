import { useEffect, useRef, useState } from 'react';
import { trpc } from '../../trpc';

export const useMemberList = (payload: { groupId: string }) => {
  const utils = trpc.useUtils();
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 20;
  const updatedPages = useRef<Set<number>>(new Set());

  const { data, isLoading, error } = trpc.group.getMembersByGroupId.useQuery(
    {
      groupId: payload.groupId,
      page: currentPage,
      pageSize,
    },
    { staleTime: Infinity }
  );

  useEffect(() => {
    if (data?.items && !updatedPages.current.has(currentPage)) {
      data.items.forEach((item) => {
        utils.group.getMemberById.setData(
          { groupId: payload.groupId, userId: item.id },
          item
        );
      });
      updatedPages.current.add(currentPage);
    }
  }, [data?.items, currentPage, utils.group.getMemberById]);

  const goToNextPage = () => {
    if (data && currentPage < data.totalPages) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
    }
  };

  const goToPage = (page: number) => {
    if (page >= 1 && data && page <= data.totalPages) {
      setCurrentPage(page);
    }
  };

  const memberProfiles = data?.items ?? [];
  const totalPages = data?.totalPages ?? 0;
  const hasNextPage = data ? currentPage < data.totalPages : false;
  const hasPreviousPage = currentPage > 1;

  return {
    memberProfiles,
    currentPage,
    totalPages,
    hasNextPage,
    hasPreviousPage,
    isLoading,
    error,
    goToNextPage,
    goToPreviousPage,
    goToPage,
  };
};

export const useMember = (payload: { groupId: string; userId: string }) => {
  const {
    data: profile,
    isLoading,
    isError,
  } = trpc.group.getMemberById.useQuery(payload);

  return {
    profile,
    isLoading,
    isError,
  };
};
