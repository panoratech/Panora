import { useCallback, useMemo } from 'react';
import { useQueryParam } from 'use-query-params';

import { NumberParamWithDefault } from '@/lib/utils';

function getTotalPages(totalItems: number, pageSize: number) {
  return Math.ceil(totalItems / pageSize);
}

interface UseQueryPaginationProps {
  totalItems?: number;
}

const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 10;

export const useQueryPagination = ({ totalItems = 0 }: UseQueryPaginationProps = {}) => {
  const [page, setPage] = useQueryParam<number>('page', NumberParamWithDefault(DEFAULT_PAGE));
  const [pageSize, setPageSize] = useQueryParam<number>('pageSize', NumberParamWithDefault(DEFAULT_PAGE_SIZE));

  const totalPages = useMemo(() => {
    return getTotalPages(totalItems, pageSize);
  }, [totalItems, pageSize]);

  const nextEnabled = useMemo(() => page < totalPages, [page, totalPages]);
  const previousEnabled = useMemo(() => page > 1, [page]);

  const setNextPage = useCallback(() => {
    if (!nextEnabled) return;
    setPage((page) => page + 1);
  }, [nextEnabled, setPage]);

  const setPreviousPage = useCallback(() => {
    if (!previousEnabled) return;
    setPage((page) => page - 1);
  }, [previousEnabled, setPage]);

  const resetPage = useCallback(() => {
    setPage(DEFAULT_PAGE);
  }, [setPage]);

  const handlePageSizeChange = useCallback(
    (newPageSize: number) => {
      setPageSize(newPageSize);
      setPage(DEFAULT_PAGE);
    },
    [setPageSize, setPage]
  );

  return {
    page,
    setPage,
    resetPage,
    pageSize,
    setPageSize: handlePageSizeChange,
    totalItems,
    totalPages: totalPages === 0 ? 1 : totalPages,
    nextEnabled,
    previousEnabled,
    setNextPage,
    setPreviousPage,
  };
};
export type UseQueryPaginationReturn = ReturnType<typeof useQueryPagination>;

