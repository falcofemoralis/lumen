import { useServiceContext } from 'Context/ServiceContext';
import { withTV } from 'Hooks/withTV';
import { useEffect, useRef, useState } from 'react';
import NotificationStore from 'Store/Notification.store';
import { RecentItemInterface } from 'Type/RecentItem.interface';
import { openFilm } from 'Util/Router';

import RecentPageComponent from './RecentPage.component';
import RecentPageComponentTV from './RecentPage.component.atv';

export function RecentPageContainer() {
  const { isSignedIn, getCurrentService } = useServiceContext();
  const [items, setItems] = useState<RecentItemInterface[]>([]);
  const paginationRef = useRef({
    page: 1,
    totalPages: 1,
  });
  const updatingStateRef = useRef(false);

  useEffect(() => {
    if (isSignedIn) {
      loadRecent(1, false);
    }

    return () => {
      getCurrentService().unloadRecentPage();
    };
  }, [isSignedIn, getCurrentService]);

  useEffect(() => {
    updatingStateRef.current = false;
  }, [items]);

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
        } = await getCurrentService().getRecent(
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
        updatingStateRef.current = false;
      }
    }
  };

  const onNextLoad = async (isRefresh = false) => {
    const newPage = isRefresh ? 1 : paginationRef.current.page + 1;

    if (newPage <= paginationRef.current.totalPages) {
      await loadRecent(isRefresh ? 1 : newPage, isRefresh);
    }
  };

  const handleOnPress = (item: RecentItemInterface) => {
    openFilm(item.link);
  };

  const removeItem = async (item: RecentItemInterface) => {
    const { id } = item;

    const arr = [...items];
    const newItems = arr.filter((i) => i.id !== id);

    setItems(newItems);

    getCurrentService().removeRecent(id).catch((error) => {
      NotificationStore.displayError(error as Error);
    });
  };

  const containerFunctions = {
    onNextLoad,
    handleOnPress,
    removeItem,
  };

  const containerProps = () => ({
    isSignedIn,
    items,
  });

  return withTV(RecentPageComponentTV, RecentPageComponent, {
    ...containerFunctions,
    ...containerProps(),
  });
}

export default RecentPageContainer;
