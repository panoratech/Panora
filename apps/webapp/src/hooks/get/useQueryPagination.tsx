import { useCallback, useMemo } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';

function getTotalPages(totalItems: number, limit: number) {
 return Math.ceil(totalItems / limit);
}

interface UseQueryPaginationProps {
 totalItems?: number;
}

const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 10;

export const useQueryPagination = ({ totalItems = 0 }: UseQueryPaginationProps = {}) => {
 const router = useRouter();
 const searchParams = useSearchParams()
 const pathname = usePathname()

 // Read query parameters directly from the URL
 const page = parseInt(searchParams.get('page')!) || DEFAULT_PAGE;
 const limit = parseInt(searchParams.get('limit')!) || DEFAULT_PAGE_SIZE;

 const totalPages = useMemo(() => getTotalPages(totalItems, limit), [totalItems, limit]);

 const nextEnabled = useMemo(() => page < totalPages, [page, totalPages]);
 const previousEnabled = useMemo(() => page > 1, [page]);

 const navigate = useCallback((newPage: number, newPageSize: number = limit) => {
    // Use router.push to navigate to the new URL with updated query parameters
    const url = `${pathname}?page=${newPage}&limit=${newPageSize}`;
    router.push(url);
 }, [router, pathname, limit]); // Include pathname and limit in the dependency array

 const setNextPage = useCallback(() => {
    if (!nextEnabled) return;
    navigate(page + 1);
 }, [nextEnabled, navigate, page]);

 const setPreviousPage = useCallback(() => {
    if (!previousEnabled) return;
    navigate(page - 1);
 }, [previousEnabled, navigate, page]);

 const resetPage = useCallback(() => {
    navigate(DEFAULT_PAGE);
 }, [navigate]);

 const handlePageSizeChange = useCallback(
    (newPageSize: number) => {
      navigate(DEFAULT_PAGE, newPageSize);
    },
    [navigate]
 );

 return {
    page,
    resetPage,
    limit,
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