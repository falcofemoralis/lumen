import { withTV } from 'Hooks/withTV';
import NotificationStore from 'Store/Notification.store';
import { PaginationInterface } from 'Type/Pagination.interface';
import { useEffect, useRef, useState } from 'react';
import FilmPagerComponent from './FilmPager.component';
import FilmPagerComponentTV from './FilmPager.component.atv';
import { FilmPagerContainerProps, PagerItemInterface } from './FilmPager.type';

export function FilmPagerContainer(props: FilmPagerContainerProps) {
  const { menuItems, onLoadFilms } = props;
  const [isLoading, setIsLoading] = useState(false);
  const [pagerItems, setPagerItems] = useState<PagerItemInterface[]>(
    menuItems.map((item, idx) => ({
      key: String(idx + 1),
      title: item.title,
      menuItem: item,
      films: idx === 0 ? [] : null,
      pagination: {
        currentPage: 1,
        totalPages: 1,
      },
    }))
  );
  const [selectedPageItemId, setSelectedPageItemId] = useState<string>(pagerItems[0].key);
  const debounce = useRef<NodeJS.Timeout | undefined>();

  useEffect(() => {
    loadFilms(pagerItems[0], { currentPage: 1, totalPages: 1 });
  }, []);

  const loadFilms = async (
    pagerItem: PagerItemInterface,
    pagination: PaginationInterface,
    isUpdate = false,
    isRefresh = false
  ) => {
    const {
      key,
      menuItem,
      films,
      pagination: { totalPages: currentTotalPages },
    } = pagerItem;
    const { currentPage } = pagination;

    if (currentPage > currentTotalPages) {
      return;
    }

    setIsLoading(true);

    try {
      const { films: newFilms, totalPages } = await onLoadFilms(menuItem, currentPage, isRefresh);

      const updatedFilms = isUpdate ? newFilms : Array.from(films ?? []).concat(newFilms);

      const newPagerItems = Array.from(pagerItems);
      const newPagerItem = newPagerItems.find(({ key: k }) => k === key);

      if (newPagerItem) {
        newPagerItem.films = updatedFilms;
        newPagerItem.pagination = {
          ...pagination,
          totalPages,
        };
      }

      setPagerItems(newPagerItems);
    } catch (error) {
      NotificationStore.displayError(error);
    } finally {
      setIsLoading(false);
    }
  };

  const getSelectedPagerItem = () => {
    return pagerItems.find(({ key }) => key === selectedPageItemId) ?? pagerItems[0];
  };

  const onNextLoad = async (
    pagination: PaginationInterface,
    isRefresh = false,
    isUpdate = false
  ) => {
    await loadFilms(getSelectedPagerItem(), pagination, isUpdate, isRefresh);
  };

  const handleMenuItemChange = (pagerItem: PagerItemInterface) => {
    const { key } = pagerItem;

    if (key !== selectedPageItemId) {
      clearTimeout(debounce.current);

      debounce.current = setTimeout(() => {
        setSelectedPageItemId(key);
        loadFilms(pagerItem, { currentPage: 1, totalPages: 1 }, true);
      }, 1000);
    }
  };

  const containerFunctions = {
    onNextLoad,
    handleMenuItemChange,
  };

  const containerProps = () => {
    return {
      pagerItems,
      selectedPagerItem: getSelectedPagerItem(),
      isLoading,
    };
  };

  return withTV(FilmPagerComponentTV, FilmPagerComponent, {
    ...containerFunctions,
    ...containerProps(),
  });
}

export default FilmPagerContainer;
