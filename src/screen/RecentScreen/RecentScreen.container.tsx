import { useNavigation } from '@react-navigation/native';
import { ThemedOverlayRef } from 'Component/ThemedOverlay/ThemedOverlay.type';
import { useConfigContext } from 'Context/ConfigContext';
import { useNetworkContext } from 'Context/NetworkContext';
import { useServiceContext } from 'Context/ServiceContext';
import { useEffect, useRef, useState } from 'react';
import NotificationStore from 'Store/Notification.store';
import { RecentItemInterface } from 'Type/RecentItem.interface';
import { openFilm } from 'Util/Router';

import RecentScreenComponent from './RecentScreen.component';
import RecentScreenComponentTV from './RecentScreen.component.atv';

export function RecentScreenContainer() {
  const { isTV } = useConfigContext();
  const { isSignedIn, currentService } = useServiceContext();
  const [items, setItems] = useState<RecentItemInterface[]>([]);
  const paginationRef = useRef({
    page: 1,
    totalPages: 1,
  });
  const updatingStateRef = useRef(false);
  const navigation = useNavigation();
  const [isLoading, setIsLoading] = useState(true);
  const { handleConnectionError } = useNetworkContext();
  const hideConfirmOverlayRef = useRef<ThemedOverlayRef | null>(null);

  useEffect(() => {
    if (isSignedIn) {
      setIsLoading(true);

      loadRecent(1, false).finally(() => {
        setIsLoading(false);
      });
    }

    return () => {
      currentService.unloadRecentScreen();
    };
  }, [isSignedIn, currentService]);

  useEffect(() => {
    updatingStateRef.current = false;
  }, [items]);

  const loadRecent = async (
    page: number,
    isRefresh: boolean
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
        } = await currentService.getRecent(
          page,
          { isRefresh }
        );

        paginationRef.current = {
          page,
          totalPages: resTotalPages,
        };

        const newItems = isRefresh ? resItems : [...items, ...resItems];

        setItems(newItems);
      } catch (error) {
        const handled = handleConnectionError(error as Error);

        if (!handled) {
          NotificationStore.displayError(error as Error);
        }

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
    openFilm({ link: item.link, poster: item.image }, navigation);
  };

  const removeItem = async (item: RecentItemInterface) => {
    const { id } = item;

    setItems((prev) => prev.filter((i) => i.id !== id));

    currentService.removeRecent(id).catch((error) => {
      NotificationStore.displayError(error as Error);
    });
  };

  const hideItemRef = useRef<RecentItemInterface | null>(null);

  const openHideConfirmOverlay = (item: RecentItemInterface) => {
    if (item.isWatched) {
      hideItemRef.current = item;
      hideItem();

      return;
    }

    hideItemRef.current = item;
    hideConfirmOverlayRef.current?.open();
  };

  const hideItem = async () => {
    if (!hideItemRef.current) {
      return;
    }

    const { id } = hideItemRef.current;
    hideItemRef.current = null;

    hideConfirmOverlayRef.current?.close();

    setItems((prev) => {
      return prev.map((i) => i.id === id ? { ...i, isWatched: !i.isWatched } : i);
    });

    currentService.hideRecent(id).catch((error) => {
      NotificationStore.displayError(error as Error);
    });
  };

  const containerProps = {
    isSignedIn,
    items,
    isLoading,
    hideConfirmOverlayRef,
    onNextLoad,
    handleOnPress,
    removeItem,
    openHideConfirmOverlay,
    hideItem,
  };

  return isTV ? <RecentScreenComponentTV { ...containerProps } /> : <RecentScreenComponent { ...containerProps } />;

}

export default RecentScreenContainer;
