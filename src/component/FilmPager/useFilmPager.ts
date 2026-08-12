import { useQueries, useQueryClient } from '@tanstack/react-query';
import { DropdownItem } from 'Component/ThemedDropdown/ThemedDropdown.type';
import { useNetworkContext } from 'Context/NetworkContext';
import { useCallback, useMemo, useRef, useState } from 'react';
import { FilmCardInterface } from 'Type/FilmCard.interface';
import { FilmListInterface } from 'Type/FilmList.interface';
import { MenuItemInterface } from 'Type/MenuItem.interface';
import { reportQueryError, STALE_TIME } from 'Util/Query';

import { PagerItemInterface } from './FilmPager.type';

export const FILMS_STALE_TIME = STALE_TIME.MEDIUM;

export interface FilmPagerQueryData {
  films: FilmCardInterface[];
  currentPage: number;
  totalPages: number;
}

export interface UseFilmPagerOptions {
  /** Base query key, e.g. ['films', 'home']. Include everything the fetch depends on (link, query, ...) */
  queryKey: readonly unknown[];
  menuItems: MenuItemInterface[];
  /** Available sorting options; the hook manages the selection and re-fetches on change */
  sorting?: DropdownItem[];
  fetchFilms: (
    menuItem: MenuItemInterface,
    page: number,
    sort?: string,
    isRefresh?: boolean
  ) => Promise<FilmListInterface>;
  /** Seed films for an item without fetching (e.g. bookmarks payload already contains the first list) */
  getInitialFilms?: (menuItem: MenuItemInterface) => FilmListInterface | undefined;
  /** Tab the pager opens on; it is the one fetched before anything is selected */
  initialIndex?: number;
  enabled?: boolean;
}

export function useFilmPager({
  queryKey,
  menuItems,
  sorting,
  fetchFilms,
  getInitialFilms,
  initialIndex = 0,
  enabled = true,
}: UseFilmPagerOptions) {
  const queryClient = useQueryClient();
  const { isInternetAvailable } = useNetworkContext();
  const [selectedSorting, setSelectedSorting] = useState<Record<string, DropdownItem>>({});
  // items become "started" once their tab has been opened; only started items are fetched
  const [startedItems, setStartedItems] = useState<Record<string, boolean>>({});
  const loadingMoreRef = useRef<Record<string, boolean>>({});
  const refreshingRef = useRef<Record<string, boolean>>({});

  const getSort = (menuItem: MenuItemInterface) => selectedSorting[menuItem.id]?.value;

  const getItemKey = (menuItem: MenuItemInterface) => [...queryKey, menuItem.id, getSort(menuItem) ?? null];

  const { dataList, isLoading } = useQueries({
    queries: menuItems.map((menuItem, index) => {
      const sort = getSort(menuItem);

      return {
        queryKey: getItemKey(menuItem),
        queryFn: async (): Promise<FilmPagerQueryData> => {
          const isRefresh = !!refreshingRef.current[menuItem.id];
          const { films, totalPages } = await fetchFilms(menuItem, 1, sort, isRefresh);

          return { films, currentPage: 1, totalPages };
        },
        initialData: () => {
          const initialFilms = getInitialFilms?.(menuItem);

          return initialFilms
            ? { films: initialFilms.films, currentPage: 1, totalPages: initialFilms.totalPages }
            : undefined;
        },
        // fetching while offline only parks the query in `error` with no data - wait for
        // the connection instead, react-query then fetches the tab on its own
        enabled: enabled && isInternetAvailable && (startedItems[menuItem.id] ?? index === initialIndex),
        staleTime: FILMS_STALE_TIME,
      };
    }),
    // failures are reported once by the query client's global error handler
    combine: (results) => ({
      dataList: results.map(({ data }) => data),
      isLoading: results.some(({ isLoading: isQueryLoading }) => isQueryLoading),
    }),
  });

  const pagerItems = useMemo<PagerItemInterface[]>(
    () => menuItems.map((menuItem, index) => {
      const data = dataList[index];

      return {
        menuItem,
        films: data?.films ?? null,
        pagination: {
          currentPage: data?.currentPage ?? 1,
          totalPages: data?.totalPages ?? 1,
        },
      };
    }),
    [menuItems, dataList]
  );

  const startItem = useCallback((menuItemId: string) => {
    setStartedItems((prev) => (prev[menuItemId] ? prev : { ...prev, [menuItemId]: true }));
  }, []);

  const onPreLoad = useCallback((item: PagerItemInterface) => {
    startItem(item.menuItem.id);
  }, [startItem]);

  const loadMore = async (menuItem: MenuItemInterface) => {
    const { id } = menuItem;
    const sort = getSort(menuItem);
    const itemKey = getItemKey(menuItem);
    const data = queryClient.getQueryData<FilmPagerQueryData>(itemKey);

    if (!data || data.currentPage >= data.totalPages || loadingMoreRef.current[id]) {
      return;
    }

    loadingMoreRef.current[id] = true;

    try {
      const nextPage = data.currentPage + 1;
      const { films, totalPages } = await fetchFilms(menuItem, nextPage, sort);

      queryClient.setQueryData<FilmPagerQueryData>(itemKey, (prev) => ({
        films: (prev?.films ?? []).concat(films),
        currentPage: nextPage,
        totalPages,
      }));
    } catch (error) {
      // paging happens outside the query function, so report it explicitly
      reportQueryError(error);
    } finally {
      loadingMoreRef.current[id] = false;
    }
  };

  const refresh = async (menuItem: MenuItemInterface) => {
    const { id } = menuItem;

    refreshingRef.current[id] = true;

    try {
      await queryClient.refetchQueries({ queryKey: getItemKey(menuItem), exact: true });
    } finally {
      refreshingRef.current[id] = false;
    }
  };

  const onNextLoad = async (isRefresh: boolean, item: PagerItemInterface) => {
    const { menuItem } = item;

    if (isRefresh) {
      await refresh(menuItem);

      return;
    }

    await loadMore(menuItem);
  };

  const handleSelectSorting = useCallback((menuItem: MenuItemInterface, item: DropdownItem) => {
    startItem(menuItem.id);
    // sort is part of the query key, so changing it fetches the sorted list automatically
    setSelectedSorting((prev) => ({ ...prev, [menuItem.id]: item }));
  }, [startItem]);

  return {
    pagerItems,
    sorting,
    selectedSorting,
    initialPage: initialIndex,
    isLoading,
    onPreLoad,
    onNextLoad,
    handleSelectSorting,
  };
}

export default useFilmPager;
