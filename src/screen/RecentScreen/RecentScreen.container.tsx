import { useNavigation } from '@react-navigation/native';
import { ThemedOverlayRef } from 'Component/ThemedOverlay/ThemedOverlay.type';
import { useConfigContext } from 'Context/ConfigContext';
import { useNetworkContext } from 'Context/NetworkContext';
import { useServiceContext } from 'Context/ServiceContext';
import { useLocalHistory } from 'Hooks/useLocalLibrary';
import { getCurrentLanguage } from 'i18n/index';
import { t } from 'i18n/translate';
import { useEffect, useMemo, useRef, useState } from 'react';
import NotificationStore from 'Store/Notification.store';
import { RecentItemInterface } from 'Type/RecentItem.interface';
import { removeLocalHistoryItem, setLocalHistoryWatched } from 'Util/LocalLibrary';
import { openFilm } from 'Util/Router';

import RecentScreenComponent from './RecentScreen.component';
import RecentScreenComponentTV from './RecentScreen.component.atv';

export function RecentScreenContainer() {
  const { isTV, isLocalLibrary } = useConfigContext();
  const { isSignedIn, currentService } = useServiceContext();
  const [items, setItems] = useState<RecentItemInterface[]>([]);
  const localHistory = useLocalHistory();
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
    if (isSignedIn && !isLocalLibrary) {
      setIsLoading(true);

      loadRecent(1, false).finally(() => {
        setIsLoading(false);
      });
    } else {
      setIsLoading(false);
    }

    return () => {
      currentService.unloadRecentScreen();
    };
  }, [isSignedIn, isLocalLibrary, currentService]);

  useEffect(() => {
    updatingStateRef.current = false;
  }, [items]);

  const localItems = useMemo((): RecentItemInterface[] => {
    if (!isLocalLibrary) {
      return [];
    }

    const locale = getCurrentLanguage();

    return localHistory.map((historyItem) => ({
      id: historyItem.id,
      link: historyItem.link,
      image: historyItem.poster,
      name: historyItem.title,
      date: new Date(historyItem.updatedAt).toLocaleDateString(locale, {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }),
      info: [
        historyItem.voiceTitle,
        historyItem.seasonId && historyItem.episodeId
          ? t('Season {{season}} - Episode {{episode}}', {
            season: historyItem.seasonId,
            episode: historyItem.episodeId,
          })
          : undefined,
      ].filter(Boolean).join(' - '),
      isWatched: historyItem.isWatched,
    }));
  }, [localHistory, isLocalLibrary]);

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
    if (isLocalLibrary) {
      return;
    }

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

    if (isLocalLibrary) {
      // the reactive local history hook refreshes the list
      removeLocalHistoryItem(id);

      return;
    }

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

    const { id, isWatched } = hideItemRef.current;
    hideItemRef.current = null;

    hideConfirmOverlayRef.current?.close();

    if (isLocalLibrary) {
      setLocalHistoryWatched(id, !isWatched);

      return;
    }

    setItems((prev) => {
      return prev.map((i) => i.id === id ? { ...i, isWatched: !i.isWatched } : i);
    });

    currentService.hideRecent(id).catch((error) => {
      NotificationStore.displayError(error as Error);
    });
  };

  const containerProps = {
    isSignedIn,
    items: isLocalLibrary ? localItems : items,
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
