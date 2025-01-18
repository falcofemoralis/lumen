import { router } from 'expo-router';
import { withTV } from 'Hooks/withTV';
import { observer } from 'mobx-react-lite';
import { useEffect, useRef, useState } from 'react';
import NotificationStore from 'Store/Notification.store';
import ServiceStore from 'Store/Service.store';
import { RecentItemInterface } from 'Type/RecentItem.interface';
import { noopFn } from 'Util/Function';

import RecentPageComponent from './RecentPage.component';
import RecentPageComponentTV from './RecentPage.component.atv';

export function RecentPageContainer() {
  const [isSignedIn, setIsSignedIn] = useState(ServiceStore.isSignedIn);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [items, setItems] = useState<RecentItemInterface[]>([]);
  const paginationRef = useRef({
    page: 1,
    totalPages: 1,
  });
  const updatingStateRef = useRef(false);

  useEffect(() => {
    if (isSignedIn !== ServiceStore.isSignedIn) {
      setIsSignedIn(ServiceStore.isSignedIn);
    }

    if (ServiceStore.isSignedIn) {
      loadRecent(noopFn, 1, false);
    }
  }, [ServiceStore.isSignedIn]);

  const loadRecent = async (
    onLoading: (state: boolean) => void,
    page: number,
    isRefresh: boolean,
  ) => {
    const { totalPages } = paginationRef.current;

    if (page > totalPages) {
      return;
    }

    if (!updatingStateRef.current) {
      updatingStateRef.current = true;

      onLoading(true);

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

        const newItems = isRefresh ? resItems : [...items, ...resItems];

        setItems(newItems);
      } catch (error) {
        NotificationStore.displayError(error as Error);
      } finally {
        updatingStateRef.current = false;
        onLoading(false);
      }
    }
  };

  const onScrollEnd = () => {
    loadRecent(noopFn, paginationRef.current.page + 1, false);
  };

  const onRefresh = async () => {
    loadRecent((state) => setIsRefreshing(state), 1, true);
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
      const newItems = items.filter((i) => i.id !== id);

      setItems(newItems);

      await ServiceStore.getCurrentService().removeRecent(id);
    } catch (error) {
      NotificationStore.displayError(error as Error);
    }
  };

  const containerFunctions = {
    onScrollEnd,
    onRefresh,
    handleOnPress,
    removeItem,
  };

  const containerProps = () => ({
    isSignedIn,
    items,
    isRefreshing,
  });

  return withTV(RecentPageComponentTV, RecentPageComponent, {
    ...containerFunctions,
    ...containerProps(),
  });
}

export default observer(RecentPageContainer);
