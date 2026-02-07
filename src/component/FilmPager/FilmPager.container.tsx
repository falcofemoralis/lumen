import { useConfigContext } from 'Context/ConfigContext';
import { useEffect } from 'react';
import NotificationStore from 'Store/Notification.store';
import { PaginationInterface } from 'Type/Pagination.interface';

import FilmPagerComponent from './FilmPager.component';
import FilmPagerComponentTV from './FilmPager.component.atv';
import { FilmPagerContainerProps, PagerItemInterface } from './FilmPager.type';

export function FilmPagerContainer({
  items,
  loadOnInit = false,
  gridStyle,
  onLoadFilms,
  onUpdateFilms,
  onRowFocus,
}: FilmPagerContainerProps) {
  const { isTV } = useConfigContext();

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
    isRefresh = false // fetch new films
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
      const { films: newFilms, totalPages } = await onLoadFilms(menuItem, currentPage, isRefresh);

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
      NotificationStore.displayError(error as Error);
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

  const containerProps = {
    items,
    gridStyle,
    onRowFocus,
    loadFilms,
    onNextLoad,
    onPreLoad,
  };

  return isTV ? <FilmPagerComponentTV { ...containerProps } /> : <FilmPagerComponent { ...containerProps } />;
}

export default FilmPagerContainer;
