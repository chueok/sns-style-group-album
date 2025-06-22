import { trpc } from '@/trpc/trpc';
import { useEffect, useState, useRef } from 'react';

/**
 * 초기 groupList를 로드하고, cache 업데이트를 위해 사용함.
 * 이후 useGroupDetail을 통해 각 데이터 접근 할 것
 */
export const useGroupList = () => {
  const utils = trpc.useUtils();
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;

  const { data, isLoading, error } = trpc.group.getMyMemberGroups.useQuery(
    {
      page: currentPage,
      pageSize,
    },
    { staleTime: Infinity }
  );

  // getMyMemberGroups 데이터를 사용해서 getGroup 쿼리들의 캐시를 업데이트
  useEffect(() => {
    if (data?.items) {
      data.items.forEach((group) => {
        const prevData = utils.group.getGroup.getData({ groupId: group.id });
        if (!prevData) {
          utils.group.getGroup.setData({ groupId: group.id }, group);
        }
      });
    }
  }, [data?.items, currentPage, utils.group.getGroup]);

  // 다음 페이지로 이동
  const goToNextPage = () => {
    if (data && currentPage < data.totalPages) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  // 이전 페이지로 이동
  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
    }
  };

  // 특정 페이지로 이동
  const goToPage = (page: number) => {
    if (page >= 1 && data && page <= data.totalPages) {
      setCurrentPage(page);
    }
  };

  const groups = data?.items ?? [];
  const totalPages = data?.totalPages ?? 0;
  const hasNextPage = data ? currentPage < data.totalPages : false;
  const hasPreviousPage = currentPage > 1;

  return {
    groups,
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

export const useGroupDetail = (groupId: string) => {
  const { data } = trpc.group.getGroup.useQuery(
    { groupId },
    { staleTime: Infinity }
  );

  return { group: data };
};
