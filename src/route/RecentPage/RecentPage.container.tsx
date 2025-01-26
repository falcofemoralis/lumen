import { router } from 'expo-router';
import { withTV } from 'Hooks/withTV';
import { observer } from 'mobx-react-lite';
import { useEffect, useRef, useState } from 'react';
import NotificationStore from 'Store/Notification.store';
import RecentStore from 'Store/Recent.store';
import ServiceStore from 'Store/Service.store';
import { RecentItemInterface } from 'Type/RecentItem.interface';

import RecentPageComponent from './RecentPage.component';
import RecentPageComponentTV from './RecentPage.component.atv';

export function RecentPageContainer() {
  const [isSignedIn, setIsSignedIn] = useState(ServiceStore.isSignedIn);
  const paginationRef = useRef({
    page: RecentStore.currentPage,
    totalPages: RecentStore.totalPages,
  });
  const updatingStateRef = useRef(false);

  useEffect(() => {
    if (isSignedIn !== ServiceStore.isSignedIn) {
      setIsSignedIn(ServiceStore.isSignedIn);
    }

    if (ServiceStore.isSignedIn && !RecentStore.isPreloaded) {
      loadRecent(1, false);
    }
  }, [ServiceStore.isSignedIn]);

  const loadRecent = async (
    page: number,
    isRefresh: boolean,
  ) => {
    const { totalPages } = paginationRef.current;

    if (page > totalPages) {
      return;
    }

    if (!updatingStateRef.current) {
      updatingStateRef.current = true;

      try {
        const {
          items: resItems,
          totalPages: resTotalPages,
        } = await ServiceStore.getCurrentService().getRecent(
          page,
          { isRefresh },
        );

        paginationRef.current = {
          page,
          totalPages: resTotalPages,
        };

        const newItems = isRefresh ? resItems : [...RecentStore.items, ...resItems];

        RecentStore.setItems(newItems);
        RecentStore.setCurrentPage(page);
        RecentStore.setTotalPages(resTotalPages);
      } catch (error) {
        NotificationStore.displayError(error as Error);
      } finally {
        updatingStateRef.current = false;
      }
    }
  };

  const onNextLoad = async (isRefresh = false) => {
    loadRecent(isRefresh ? 1 : paginationRef.current.page + 1, isRefresh);
  };

  const handleOnPress = (item: RecentItemInterface) => {
    router.push({
      pathname: '/[film]',
      params: {
        film: item.link,
      },
    });
  };

  const removeItem = async (item: RecentItemInterface) => {
    const { id } = item;

    try {
      const newItems = RecentStore.items.filter((i) => i.id !== id);

      RecentStore.setItems(newItems);

      await ServiceStore.getCurrentService().removeRecent(id);
    } catch (error) {
      NotificationStore.displayError(error as Error);
    }
  };

  const containerFunctions = {
    onNextLoad,
    handleOnPress,
    removeItem,
  };

  const containerProps = () => ({
    isSignedIn,
    items: RecentStore.items,
  });

  return withTV(RecentPageComponentTV, RecentPageComponent, {
    ...containerFunctions,
    ...containerProps(),
  });
}

export default observer(RecentPageContainer);
