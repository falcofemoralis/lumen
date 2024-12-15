import { withTV } from 'Hooks/withTV';
import { observer } from 'mobx-react-lite';
import { useEffect, useRef, useState } from 'react';
import { PagerViewOnPageSelectedEvent } from 'react-native-pager-view';
import NotificationStore from 'Store/Notification.store';
import ServiceStore from 'Store/Service.store';
import { PagerItemInterface } from 'Type/PagerItem.interface';
import { PaginationInterface } from 'Type/Pagination.interface';
import HomePageComponent from './HomePage.component';
import HomePageComponentTV from './HomePage.component.atv';

export function HomePageContainer() {
  const [isLoading, setIsLoading] = useState(false);
  const [pagerItems, setPagerItems] = useState<PagerItemInterface[]>(
    ServiceStore.getCurrentService()
      .getHomeMenu()
      .map((item, idx) => ({
        key: idx + 1,
        menuItem: item,
        films: idx === 0 ? [] : null,
        pagination: {
          currentPage: 1,
          totalPages: 1,
        },
      }))
  );
  const [selectedPageItemId, setSelectedPageItemId] = useState<number>(pagerItems[0].key);
  const debounce = useRef<NodeJS.Timeout | undefined>();

  useEffect(() => {
    console.log('use effect');

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

    console.log(
      `loadFilms for ${pagerItem.menuItem.title} page ${currentPage} of ${currentTotalPages}`
    );

    setIsLoading(true);

    try {
      const { films: newFilms, totalPages } =
        await ServiceStore.getCurrentService().getHomeMenuFilms(menuItem, currentPage, {
          isRefresh,
        });

      const updatedFilms = isUpdate ? newFilms : Array.from(films ?? []).concat(newFilms);

      const newPagerItems = Array.from(pagerItems);
      newPagerItems[key - 1] = {
        ...newPagerItems[key - 1],
        films: updatedFilms,
        pagination: {
          ...pagination,
          totalPages,
        },
      };

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
    console.log('onNextLoad', pagination);

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

  const handlePagerScroll = (e: PagerViewOnPageSelectedEvent) => {
    const {
      nativeEvent: { position },
    } = e;
    const pagerItem = pagerItems[position];
    const { key, films } = pagerItem;

    if (key !== selectedPageItemId) {
      if (!films) {
        console.log('handlePagerScroll');

        const newPagerItems = Array.from(pagerItems);
        newPagerItems[key - 1] = {
          ...newPagerItems[key - 1],
          films: [],
        };

        setPagerItems(newPagerItems);

        loadFilms(pagerItem, { currentPage: 1, totalPages: 1 }, true);
      }

      setSelectedPageItemId(key);
    }
  };

  const containerFunctions = {
    onNextLoad,
    handleMenuItemChange,
    handlePagerScroll,
  };

  const containerProps = () => {
    return {
      pagerItems,
      selectedPagerItem: getSelectedPagerItem(),
      isLoading,
    };
  };

  return withTV(HomePageComponentTV, HomePageComponent, {
    ...containerFunctions,
    ...containerProps(),
  });
}

export default observer(HomePageContainer);
