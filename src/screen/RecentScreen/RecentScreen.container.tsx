import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useMutation } from '@tanstack/react-query';
import { ThemedOverlayRef } from 'Component/ThemedOverlay/ThemedOverlay.type';
import { useConfigContext } from 'Context/ConfigContext';
import { useNetworkContext } from 'Context/NetworkContext';
import { useServiceContext } from 'Context/ServiceContext';
import { useLocalHistory } from 'Hooks/useLocalLibrary';
import { usePaginatedQuery } from 'Hooks/usePaginatedQuery';
import { getCurrentLanguage } from 'i18n/index';
import { t } from 'i18n/translate';
import { NOTIFICATIONS_SCREEN, PLAYER_SCREEN } from 'Navigation/navigationRoutes';
import { AppStackParamList } from 'Navigation/navigationTypes';
import { useCallback, useEffect, useMemo, useRef } from 'react';
import { Platform } from 'react-native';
import { RecentItemInterface } from 'Type/RecentItem.interface';
import NotificationStore from 'Store/Notification.store';
import RouterStore from 'Store/Router.store';
import { removeLocalHistoryItem, setLocalHistoryWatched } from 'Util/LocalLibrary';
import { sourcePlaybackRouter, sourceRouter } from '../../source';
import { navigate } from 'Util/Navigation';
import { getSavedTime } from 'Util/Player';
import { getLastSavedEpisode } from 'Util/Player/savedTimeUtil';
import { queryKeys } from 'Util/Query';
import { openFilm } from 'Util/Router';

import RecentScreenComponent from './RecentScreen.component';
import { RecentHub } from './RecentScreen.hub';
import RecentScreenComponentTV from './RecentScreen.component.atv';

export function RecentScreenContainer() {
  const { isTV, isLocalLibrary, recentDisplayMode, newHomeInterface, recentTabsInterface } = useConfigContext();
  const { isSignedIn, currentService } = useServiceContext();
  const localHistory = useLocalHistory();
  const navigation = useNavigation<NativeStackNavigationProp<AppStackParamList>>();
  const hideConfirmOverlayRef = useRef<ThemedOverlayRef | null>(null);
  const removeConfirmOverlayRef = useRef<ThemedOverlayRef | null>(null);
  const { isInternetAvailable } = useNetworkContext();

  const isRemote = isSignedIn && !isLocalLibrary;

  const { items, isLoading, onNextLoad, updateItems } = usePaginatedQuery<RecentItemInterface>({
    queryKey: queryKeys.recent(),
    fetchPage: (page, isRefresh) => currentService.getRecent(page, { isRefresh }),
    enabled: isRemote && isInternetAvailable,
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
      filmCard: historyItem.filmCard,
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

  const { mutate: continueWatching } = useMutation({
    mutationFn: async (item: RecentItemInterface) => {
      const adapter = sourceRouter.getAdapterForLink(item.link);
      const film = adapter ? await adapter.getFilm(item.link) : await currentService.getFilm(item.link);

      if (!film) {
        throw new Error(t('No video available'));
      }

      const saved = getSavedTime(film);
      const historyItem = localHistory.find(
        (historyEntry) =>
          historyEntry.id === film.id || historyEntry.link === item.link
      );

      const lastVoiceId = saved?.lastVoiceId ?? historyItem?.voiceId;

      if (!lastVoiceId) {
        throw new Error(t('No video available'));
      }

      const playback = sourcePlaybackRouter.getAdapterForFilmLink(film.link);
      if (playback) film.voices = await playback.getFilmVoices(film);
      const voiceData = saved?.voices?.[lastVoiceId] ?? null;
      const voice = film.voices.find(({ id }) => id === lastVoiceId);

      if (!voice) {
        throw new Error(t('No video available'));
      }

      if (film.hasSeasons) {
        const savedEpisode = getLastSavedEpisode(voiceData);
        const seasonId = savedEpisode.seasonId ?? historyItem?.seasonId;
        const episodeId = savedEpisode.episodeId ?? historyItem?.episodeId;

        if (!seasonId || !episodeId) {
          throw new Error(t('Current season or episode not saved.'));
        }

        const selectedVoice = {
          ...voice,
          lastSeasonId: seasonId,
          lastEpisodeId: episodeId,
        };

        const playbackAdapter =
          sourcePlaybackRouter.getAdapterForFilmLink(film.link);

        const video = playbackAdapter
          ? await playbackAdapter.getFilmStreamsByEpisodeId(
              film,
              selectedVoice,
              seasonId,
              episodeId,
            )
          : await currentService.getFilmStreamsByEpisodeId(
              film,
              selectedVoice,
              seasonId,
              episodeId,
            );

        return {
          film,
          video,
          voice: selectedVoice,
        };
      }

      const playbackAdapter =
        sourcePlaybackRouter.getAdapterForFilmLink(film.link);

      const video = playbackAdapter
        ? await playbackAdapter.getFilmStreamsByVoice(film, voice)
        : await currentService.getFilmStreamsByVoice(film, voice);

      return {
        film,
        video,
        voice,
      };
    },
    onSuccess: ({ film, video, voice }) => {
      if (!video) {
        NotificationStore.displayMessage(t('No video available'));
        return;
      }

      RouterStore.pushData(PLAYER_SCREEN, {
        video,
        film,
        voice,
      });

      navigate(PLAYER_SCREEN);
    },
    onError: (error) => {
      NotificationStore.displayError(error as Error);
    },
  });

  const handleContinueWatching = useCallback((item: RecentItemInterface) => {
    continueWatching(item);
  }, [continueWatching]);
  const openNotifications = useCallback(() => {
    navigation.navigate(NOTIFICATIONS_SCREEN);
  }, [navigation]);
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
  const removeItemRef = useRef<RecentItemInterface | null>(null);

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

  const openRemoveConfirmOverlay = useCallback((item: RecentItemInterface) => {
    removeItemRef.current = item;
    removeConfirmOverlayRef.current?.open();
  }, []);

  const confirmRemoveItem = useCallback(() => {
    if (!removeItemRef.current) {
      return;
    }

    const item = removeItemRef.current;
    removeItemRef.current = null;

    removeConfirmOverlayRef.current?.close();
    removeItem(item);
  }, [removeItem]);
  const containerProps = {
    displayMode: recentDisplayMode,
    isSignedIn,
    items: isLocalLibrary ? localItems : items,
    isLoading: !isLocalLibrary && isLoading,
    hideConfirmOverlayRef,
    removeConfirmOverlayRef,
    onNextLoad: handleNextLoad,
    handleOnPress,
    handleContinueWatching,
    removeItem,
    openRemoveConfirmOverlay,
    confirmRemoveItem,
    openHideConfirmOverlay,
    hideItem,
    openNotifications,
  };

  const content = isTV
    ? <RecentScreenComponentTV { ...containerProps } />
    : <RecentScreenComponent { ...containerProps } />;
  return (isTV || Platform.OS === 'web' ? recentTabsInterface : newHomeInterface || recentTabsInterface)
    ? <RecentHub>{ content }</RecentHub> : content;

}

export default RecentScreenContainer;
