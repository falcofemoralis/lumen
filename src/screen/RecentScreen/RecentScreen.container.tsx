import { useNavigation } from '@react-navigation/native';
import { useMutation } from '@tanstack/react-query';
import { ThemedOverlayRef } from 'Component/ThemedOverlay/ThemedOverlay.type';
import { useConfigContext } from 'Context/ConfigContext';
import { useServiceContext } from 'Context/ServiceContext';
import { useLocalHistory } from 'Hooks/useLocalLibrary';
import { usePaginatedQuery } from 'Hooks/usePaginatedQuery';
import { getCurrentLanguage } from 'i18n/index';
import { t } from 'i18n/translate';
import { useCallback, useEffect, useMemo, useRef } from 'react';
import { RecentItemInterface } from 'Type/RecentItem.interface';
import { removeLocalHistoryItem, setLocalHistoryWatched } from 'Util/LocalLibrary';
import { queryKeys } from 'Util/Query';
import { openFilm } from 'Util/Router';

import RecentScreenComponent from './RecentScreen.component';
import RecentScreenComponentTV from './RecentScreen.component.atv';

export function RecentScreenContainer() {
  const { isTV, isLocalLibrary } = useConfigContext();
  const { isSignedIn, currentService } = useServiceContext();
  const localHistory = useLocalHistory();
  const navigation = useNavigation();
  const hideConfirmOverlayRef = useRef<ThemedOverlayRef | null>(null);

  const isRemote = isSignedIn && !isLocalLibrary;

  const { items, isLoading, onNextLoad, updateItems } = usePaginatedQuery<RecentItemInterface>({
    queryKey: queryKeys.recent(),
    fetchPage: (page, isRefresh) => currentService.getRecent(page, { isRefresh }),
    enabled: isRemote,
  });

  useEffect(() => () => {
    // the service keeps the full parsed list around to page through it locally
    currentService.unloadRecentScreen();
  }, [currentService]);

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

  const handleNextLoad = async (isRefresh = false) => {
    if (isLocalLibrary) {
      return;
    }

    await onNextLoad(isRefresh);
  };

  const handleOnPress = useCallback((item: RecentItemInterface) => {
    openFilm({ link: item.link, poster: item.image }, navigation);
  }, [navigation]);

  const { mutate: removeRecent } = useMutation({
    mutationFn: (id: string) => currentService.removeRecent(id),
    // the row disappears immediately; a failure only surfaces as a toast, matching
    // the previous fire-and-forget behavior
    onMutate: (id: string) => {
      updateItems((pageItems) => pageItems.filter((i) => i.id !== id));
    },
  });

  const { mutate: hideRecent } = useMutation({
    mutationFn: (id: string) => currentService.hideRecent(id),
    onMutate: (id: string) => {
      updateItems((pageItems) => pageItems.map(
        (i) => (i.id === id ? { ...i, isWatched: !i.isWatched } : i)
      ));
    },
  });

  const removeItem = useCallback((item: RecentItemInterface) => {
    const { id } = item;

    if (isLocalLibrary) {
      // the reactive local history hook refreshes the list
      removeLocalHistoryItem(id);

      return;
    }

    removeRecent(id);
  }, [isLocalLibrary, removeRecent]);

  const hideItemRef = useRef<RecentItemInterface | null>(null);

  const hideItem = useCallback(() => {
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

    hideRecent(id);
  }, [isLocalLibrary, hideRecent]);

  const openHideConfirmOverlay = useCallback((item: RecentItemInterface) => {
    if (item.isWatched) {
      hideItemRef.current = item;
      hideItem();

      return;
    }

    hideItemRef.current = item;
    hideConfirmOverlayRef.current?.open();
  }, [hideItem]);

  const containerProps = {
    isSignedIn,
    items: isLocalLibrary ? localItems : items,
    isLoading,
    hideConfirmOverlayRef,
    onNextLoad: handleNextLoad,
    handleOnPress,
    removeItem,
    openHideConfirmOverlay,
    hideItem,
  };

  return isTV ? <RecentScreenComponentTV { ...containerProps } /> : <RecentScreenComponent { ...containerProps } />;

}

export default RecentScreenContainer;
