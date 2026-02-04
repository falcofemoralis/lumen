import { useConfigContext } from 'Context/ConfigContext';
import { useEffect, useState } from 'react';
import NotificationStore from 'Store/Notification.store';
import { PaginationInterface } from 'Type/Pagination.interface';

import FilmPagerComponent from './FilmPager.component';
import FilmPagerComponentTV from './FilmPager.component.atv';
import { FilmPagerContainerProps, PagerItemInterface } from './FilmPager.type';

export function FilmPagerContainer({
  menuItems,
  filmPager,
  loadOnInit = false,
  gridStyle,
  onLoadFilms,
  onUpdateFilms,
  onRowFocus,
}: FilmPagerContainerProps) {
  const { isTV } = useConfigContext();

  const mapItems = (items: typeof menuItems) => items.map((item, idx) => ({
    key: String(idx + 1),
    title: item.title,
    menuItem: item,
    films: null,
    pagination: {
      currentPage: 1,
      totalPages: 1,
    },
  }));

  const [pagerItems, setPagerItems] = useState<PagerItemInterface[]>(mapItems(menuItems));

  useEffect(() => {
    if (loadOnInit) {
      loadFilms(pagerItems[0], { currentPage: 1, totalPages: 1 });
    }
  }, []);

  useEffect(() => {
    const newItems = pagerItems.map((item) => {
      const { menuItem: { id } } = item;
      const pagerItem = filmPager[id];

      if (!pagerItem) {
        return item;
      }

      const {
        filmList: {
          films = [],
          totalPages = 1,
        } = {},
      } = pagerItem;

      return {
        ...item,
        films,
        pagination: {
          ...item.pagination,
          totalPages,
        },
      };
    });

    setPagerItems(newItems);
  }, [filmPager]);

  const loadFilms = async (
    pagerItem: PagerItemInterface,
    pagination: PaginationInterface,
    isUpdate = false, // replace current films with new ones
    isRefresh = false // fetch new films
  ) => {
    const {
      key,
      menuItem,
      films,
      pagination: { totalPages: currentTotalPages },
    } = pagerItem;
    const { currentPage } = pagination;
    const { id: menuItemId } = menuItem;

    if (currentPage > currentTotalPages) {
      return;
    }

    try {
      const { films: newFilms, totalPages } = await onLoadFilms(menuItem, currentPage, isRefresh);

      const updatedFilms = isUpdate ? newFilms : Array.from(films ?? []).concat(newFilms);

      const currentPagerItem = pagerItems.find(({ key: crKey }) => crKey === key);
      if (currentPagerItem) {
        currentPagerItem.pagination.currentPage = currentPage;
      }

      onUpdateFilms(menuItemId, {
        films: updatedFilms,
        totalPages,
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
    pagerItems,
    gridStyle,
    onRowFocus,
    loadFilms,
    onNextLoad,
    onPreLoad,
  };

  return isTV ? <FilmPagerComponentTV { ...containerProps } /> : <FilmPagerComponent { ...containerProps } />;
}

export default FilmPagerContainer;
