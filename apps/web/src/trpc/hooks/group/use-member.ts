import { useEffect, useRef, useState } from 'react';
import { trpc } from '../../trpc';
import { useAuth } from '../auth/use-auth';

export const useMemberList = (payload: { groupId?: string }) => {
  const { user } = useAuth();

  const utils = trpc.useUtils();
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 20;
  const updatedPages = useRef<Set<number>>(new Set());

  const { data, isLoading, error } = trpc.group.getMembersByGroupId.useQuery(
    {
      groupId: payload.groupId || '',
      page: currentPage,
      pageSize,
    },
    {
      staleTime: Infinity,
      enabled: !!user && !!payload.groupId,
    }
  );

  useEffect(() => {
    if (data?.items && !updatedPages.current.has(currentPage)) {
      data.items.forEach((item) => {
        if (!payload.groupId) {
          return;
        }
        utils.group.getMemberById.setData(
          { groupId: payload.groupId, memberId: item.id },
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

  const memberList = data?.items ?? [];
  const totalPages = data?.totalPages ?? 0;
  const hasNextPage = data ? currentPage < data.totalPages : false;
  const hasPreviousPage = currentPage > 1;

  return {
    memberList,
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

export const useMember = (payload: { groupId?: string; memberId?: string }) => {
  const { user } = useAuth();
  const {
    data: profile,
    isLoading,
    isError,
  } = trpc.group.getMemberById.useQuery(
    {
      groupId: payload.groupId!,
      memberId: payload.memberId!,
    },
    {
      enabled: !!user && !!payload.groupId && !!payload.memberId,
    }
  );

  return {
    profile,
    isLoading,
    isError,
  };
};
