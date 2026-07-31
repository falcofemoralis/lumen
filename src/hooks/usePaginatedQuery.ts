import { InfiniteData, useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo } from 'react';
import { reportQueryError, STALE_TIME } from 'Util/Query';

/** Shape every paginated service endpoint returns */
export interface PaginatedResponseInterface<T> {
  items: T[];
  totalPages: number;
}

export interface UsePaginatedQueryOptions<T> {
  queryKey: readonly unknown[];
  /**
   * `isRefresh` is forwarded to the service so it can bypass its own page cache
   * when the user explicitly pulls to refresh.
   */
  fetchPage: (page: number, isRefresh: boolean) => Promise<PaginatedResponseInterface<T>>;
  enabled?: boolean;
  staleTime?: number;
}

type PaginatedInfiniteData<T> = InfiniteData<PaginatedResponseInterface<T>, number>;

/**
 * Standard hook for the `{ items, totalPages }` endpoints. It replaces the
 * page/totalPages refs and "is a load already running" guards that every paginated
 * screen used to repeat, and keeps the `onNextLoad(isRefresh)` prop the list
 * components already expect.
 */
export function usePaginatedQuery<T>({
  queryKey,
  fetchPage,
  enabled = true,
  staleTime = STALE_TIME.NONE,
}: UsePaginatedQueryOptions<T>) {
  const queryClient = useQueryClient();

  const query = useInfiniteQuery({
    queryKey,
    enabled,
    staleTime,
    initialPageParam: 1,
    queryFn: ({ pageParam }) => fetchPage(pageParam, false),
    getNextPageParam: (lastPage, allPages) => (
      allPages.length < lastPage.totalPages ? allPages.length + 1 : undefined
    ),
  });

  const { data, hasNextPage, isFetchingNextPage, fetchNextPage } = query;

  const items = useMemo(
    () => data?.pages.flatMap(({ items: pageItems }) => pageItems) ?? [],
    [data]
  );

  /**
   * A pull to refresh re-reads the first page only and replaces the accumulated ones,
   * so the list keeps showing the old items until the new first page has arrived.
   */
  const refresh = async () => {
    try {
      const firstPage = await fetchPage(1, true);

      queryClient.setQueryData<PaginatedInfiniteData<T>>(queryKey, {
        pages: [firstPage],
        pageParams: [1],
      });
    } catch (error) {
      // the fetch runs outside the query function, so report it explicitly
      reportQueryError(error);
    }
  };

  const onNextLoad = async (isRefresh = false) => {
    if (isRefresh) {
      await refresh();

      return;
    }

    if (!hasNextPage || isFetchingNextPage) {
      return;
    }

    await fetchNextPage();
  };

  /**
   * Patches the already fetched pages in place - used for optimistic list edits.
   * The updater runs per page, so both mapping an item and filtering one out work.
   */
  const updateItems = (updater: (pageItems: T[]) => T[]) => {
    queryClient.setQueryData<PaginatedInfiniteData<T>>(queryKey, (prev) => (prev ? {
      ...prev,
      pages: prev.pages.map((page) => ({ ...page, items: updater(page.items) })),
    } : prev));
  };

  return {
    ...query,
    items,
    /** `null` until the first page has resolved, so callers can tell "empty" from "not loaded" */
    itemsOrNull: data ? items : null,
    onNextLoad,
    refresh,
    updateItems,
  };
}

export default usePaginatedQuery;
