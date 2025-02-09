import { router } from 'expo-router';
import { withTV } from 'Hooks/withTV';
import { observer } from 'mobx-react-lite';
import { useEffect, useRef, useState } from 'react';
import ConfigStore from 'Store/Config.store';
import NotificationStore from 'Store/Notification.store';
import ServiceStore from 'Store/Service.store';
import { RecentItemInterface } from 'Type/RecentItem.interface';

import RecentPageComponent from './RecentPage.component';
import RecentPageComponentTV from './RecentPage.component.atv';
import { THUMBNAILS_AMOUNT, THUMBNAILS_AMOUNT_TV } from './RecentPage.config';

export function RecentPageContainer() {
  const [isSignedIn, setIsSignedIn] = useState(ServiceStore.isSignedIn);
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

        const newItems = isRefresh ? resItems : [...items, ...resItems];

        setItems(newItems);
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

    const arr = [...items];
    const newItems = arr.filter((i) => i.id !== id);

    setItems(newItems);

    ServiceStore.getCurrentService().removeRecent(id).catch((error) => {
      NotificationStore.displayError(error as Error);
    });
  };

  const getItems = () => {
    if (!items.length) {
      return Array(ConfigStore.isTV ? THUMBNAILS_AMOUNT_TV : THUMBNAILS_AMOUNT).fill({
        id: '',
        link: '',
        image: '',
        date: '',
        name: '',
        isThumbnail: true,
      }) as RecentItemInterface[];
    }

    return items;
  };

  const containerFunctions = {
    onNextLoad,
    handleOnPress,
    removeItem,
  };

  const containerProps = () => ({
    isSignedIn,
    items: getItems(),
  });

  return withTV(RecentPageComponentTV, RecentPageComponent, {
    ...containerFunctions,
    ...containerProps(),
  });
}

export default observer(RecentPageContainer);
