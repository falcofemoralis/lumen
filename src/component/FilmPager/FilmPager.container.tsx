import { withTV } from 'Hooks/withTV';
import { useEffect, useRef, useState } from 'react';
import { useLockSpatialNavigation } from 'react-tv-space-navigation';
import ConfigStore from 'Store/Config.store';
import NotificationStore from 'Store/Notification.store';
import { PaginationInterface } from 'Type/Pagination.interface';

import FilmPagerComponent from './FilmPager.component';
import FilmPagerComponentTV from './FilmPager.component.atv';
import { FilmPagerContainerProps, PagerItemInterface } from './FilmPager.type';

export function FilmPagerContainer({
  menuItems,
  filmPager,
  loadOnInit = false,
  onLoadFilms,
  onUpdateFilms,
}: FilmPagerContainerProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [pagerItems] = useState<PagerItemInterface[]>(
    menuItems.map((item, idx) => ({
      key: String(idx + 1),
      title: item.title,
      menuItem: item,
      films: null,
      pagination: {
        currentPage: 1,
        totalPages: 1,
      },
    })),
  );
  const [selectedPageItemId, setSelectedPageItemId] = useState<string>(pagerItems[0]?.key);
  const debounce = useRef<NodeJS.Timeout | undefined>();
  const { lock, unlock } = useLockSpatialNavigation();

  useEffect(() => {
    if (loadOnInit) {
      loadFilms(pagerItems[0], { currentPage: 1, totalPages: 1 });
    }
  }, []);

  const loadFilms = async (
    pagerItem: PagerItemInterface,
    pagination: PaginationInterface,
    isUpdate = false, // replace current films with new ones
    isRefresh = false, // fetch new films
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

    setIsLoading(true);

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
    } finally {
      setIsLoading(false);
    }
  };

  const onNextLoad = async (isRefresh = false) => {
    const { pagination } = getSelectedPagerItem();

    const newPage = {
      ...pagination,
      currentPage: !isRefresh ? pagination.currentPage + 1 : 1,
    };

    await loadFilms(getSelectedPagerItem(), newPage, isRefresh, isRefresh);
  };

  const handleMenuItemChange = (pagerItem: PagerItemInterface) => {
    const { key } = pagerItem;

    if (key !== selectedPageItemId) {
      clearTimeout(debounce.current);

      // eslint-disable-next-line @typescript-eslint/no-misused-promises
      debounce.current = setTimeout(async () => {
        if (ConfigStore.isTV) lock();

        setSelectedPageItemId(key);
        if (!pagerItem.films) {
          await loadFilms(pagerItem, { currentPage: 1, totalPages: 1 }, true);
        }

        if (ConfigStore.isTV) {
          setTimeout(() => {
            unlock();
          }, 0);
        }
      }, 1000);
    }
  };

  const getPagerItems = () => pagerItems.map((item) => {
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

  const getSelectedPagerItem = () => getPagerItems().find(
    ({ key }) => key === selectedPageItemId,
  ) ?? pagerItems[0];

  const containerFunctions = {
    onNextLoad,
    handleMenuItemChange,
  };

  const containerProps = () => ({
    pagerItems: getPagerItems(),
    selectedPagerItem: getSelectedPagerItem(),
    isLoading,
  });

  return withTV(FilmPagerComponentTV, FilmPagerComponent, {
    ...containerFunctions,
    ...containerProps(),
  });
}

export default FilmPagerContainer;
