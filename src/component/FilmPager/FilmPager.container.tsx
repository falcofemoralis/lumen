import { DropdownItem } from 'Component/ThemedDropdown/ThemedDropdown.type';
import { useConfigContext } from 'Context/ConfigContext';
import { useNetworkContext } from 'Context/NetworkContext';
import { useCallback, useEffect, useState } from 'react';
import NotificationStore from 'Store/Notification.store';
import { PaginationInterface } from 'Type/Pagination.interface';

import FilmPagerComponent from './FilmPager.component';
import FilmPagerComponentTV from './FilmPager.component.atv';
import { FilmPagerContainerProps, PagerItemInterface } from './FilmPager.type';

export function FilmPagerContainer({
  items,
  loadOnInit = false,
  gridStyle,
  isGridVisible = true,
  isEmpty = false,
  ListHeaderComponent,
  ListEmptyComponent,
  isAddSafeArea,
  sorting,
  menuDefaultFocus,
  onLoadFilms,
  onUpdateFilms,
  onRowFocus,
}: FilmPagerContainerProps) {
  const { isTV } = useConfigContext();
  const [selectedSorting, setSelectedSorting] = useState<Record<string, DropdownItem> | null>(
    sorting && sorting.length > 0 ? {} : null
  );
  const { handleConnectionError } = useNetworkContext();

  useEffect(() => {
    if (loadOnInit) {
      const firstItem = Object.values(items)[0];
      loadFilms(firstItem, firstItem.pagination);
    }
  }, []);

  const loadFilms = async (
    pagerItem: PagerItemInterface,
    newPagination: PaginationInterface,
    isUpdate = false, // replace current films with new ones
    isRefresh = false, // fetch new films
    sort?: string
  ) => {
    const {
      menuItem,
      films,
      pagination,
    } = pagerItem;
    const {
      totalPages: currentTotalPages,
    } = pagination;
    const {
      currentPage,
    } = newPagination;
    const { id: menuItemId } = menuItem;

    if (currentPage > currentTotalPages) {
      return;
    }

    try {
      const { films: newFilms, totalPages } = await onLoadFilms(menuItem, currentPage, isRefresh, sort);

      const updatedFilms = isUpdate ? newFilms : Array.from(films ?? []).concat(newFilms);

      onUpdateFilms(menuItemId, {
        ...pagerItem,
        films: updatedFilms,
        pagination: {
          ...pagination,
          totalPages,
          currentPage,
        },
      });
    } catch (error) {
      const handled = handleConnectionError(error as Error);

      if (!handled) {
        NotificationStore.displayError(error as Error);
      }
    }
  };

  const onPreLoad = async (item: PagerItemInterface) => {
    loadFilms(item, { currentPage: 1, totalPages: 1 });
  };

  const onNextLoad = async (isRefresh = false, item: PagerItemInterface) => {
    const { pagination } = item;

    const newPage = {
      ...pagination,
      currentPage: !isRefresh ? pagination.currentPage + 1 : 1,
    };

    await loadFilms(item, newPage, isRefresh, isRefresh);
  };

  const handleSelectSorting = useCallback((menuItem: PagerItemInterface['menuItem'], item: DropdownItem) => {
    const { id } = menuItem;

    setSelectedSorting((prev) => ({ ...prev, [id]: item }));

    loadFilms({
      menuItem,
      films: null,
      pagination: { currentPage: 1, totalPages: 1 },
    }, { currentPage: 1, totalPages: 1 }, true, true, item.value);
  }, []);

  const containerProps = {
    items,
    gridStyle,
    isGridVisible,
    isEmpty,
    isAddSafeArea,
    sorting,
    selectedSorting,
    menuDefaultFocus,
    ListHeaderComponent,
    ListEmptyComponent,
    onRowFocus,
    loadFilms,
    onNextLoad,
    onPreLoad,
    handleSelectSorting,
  };

  return isTV ? <FilmPagerComponentTV { ...containerProps } /> : <FilmPagerComponent { ...containerProps } />;
}

export default FilmPagerContainer;
