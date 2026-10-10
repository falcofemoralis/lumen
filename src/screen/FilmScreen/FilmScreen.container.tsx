import {
  completeHandler,
  createDownloadTask,
} from '@kesha-antonov/react-native-background-downloader';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { PlayerVideoSelectorRef } from 'Component/PlayerVideoSelector/PlayerVideoSelector.container';
import { ThemedOverlayRef } from 'Component/ThemedOverlay/ThemedOverlay.type';
import { useConfigContext } from 'Context/ConfigContext';
import { useServiceContext } from 'Context/ServiceContext';
import { useLocalBookmarks, useLocalHistory } from 'Hooks/useLocalLibrary';
import { t } from 'i18n/translate';
import { FILM_TRAILER_SCREEN, PLAYER_SCREEN } from 'Navigation/navigationRoutes';
import { AppStackParamList } from 'Navigation/navigationTypes';
import {
  useCallback,
  useMemo,
  useRef,
} from 'react';
import { BackHandler, Share } from 'react-native';
import NotificationStore from 'Store/Notification.store';
import RouterStore from 'Store/Router.store';
import { DownloadLinkInterface } from 'Type/DownloadLink.interface';
import { FilmInterface } from 'Type/Film.interface';
import { FilmVideoInterface } from 'Type/FilmVideo.interface';
import { FilmVoiceInterface } from 'Type/FilmVoice.interface';
import { ScheduleItemInterface } from 'Type/ScheduleItem.interface';
import {
  getDownloadErrorMessage, getDownloadsDir, getUrlExtension, normalizeName, TaskIdStorage, uuid,
} from 'Util/Download';
import {
  applyLocalScheduleMarks,
  getLocalBookmarksForFilm,
  setLocalScheduleMark,
} from 'Util/LocalLibrary';
import { navigate } from 'Util/Navigation';
import { getPlayerQuality, getSavedTime } from 'Util/Player';
import { queryKeys } from 'Util/Query';
import { openActor, openCategory, openFilm } from 'Util/Router';
import { sourcePlaybackRouter, sourceRouter } from '../../source';
import { withDeadline } from '../../source/request';

import FilmScreenComponent from './FilmScreen.component';
import FilmScreenComponentTV from './FilmScreen.component.atv';
import { MINIMUM_SCHEDULE_ITEMS } from './FilmScreen.config';
import { FilmScreenContainerProps } from './FilmScreen.type';

export function FilmScreenContainer({ route }: FilmScreenContainerProps) {
  const { link: linkArg, thumbnailPoster, libraryFilmId } = (route.params ?? {}) as { link: string, thumbnailPoster?: string, libraryFilmId?: string };
  const {
    isTV,
    downloadsPath,
    downloadsSaveSubtitles,
    downloadsSavePoster,
    isContinueBtnEnabled,
    isLocalLibrary,
    showVotesCount,
    showRecommendations,
    showAgeRating,
  } = useConfigContext();
  const navigation = useNavigation<NativeStackNavigationProp<AppStackParamList>>();
  const { isSignedIn, currentService, prepareShareBody } = useServiceContext();
  const queryClient = useQueryClient();
  const playerVideoSelectorOverlayRef = useRef<PlayerVideoSelectorRef>(null);
  const scheduleOverlayRef = useRef<ThemedOverlayRef>(null);
  const commentsOverlayRef = useRef<ThemedOverlayRef>(null);
  const bookmarksOverlayRef = useRef<ThemedOverlayRef>(null);
  const descriptionOverlayRef = useRef<ThemedOverlayRef>(null);
  const playerVideoDownloaderOverlayRef = useRef<PlayerVideoSelectorRef>(null);
  const ratingOverlayRef = useRef<ThemedOverlayRef>(null);

  // fallback to deep link url
  let link = linkArg;
  let isDeepLink = false;
  if (!link && route?.path) {
    link = route.path;
    isDeepLink = true;
  }

  const localHistory = useLocalHistory();
  const localBookmarks = useLocalBookmarks();

  const updateFilmVoiceData = async (data: FilmInterface | null) => {
    // logged in users already use service built-in system
    if (!data) {
      return;
    }

    const savedTime = getSavedTime(data);
    const localHistoryItem = isLocalLibrary
      ? localHistory.find((item) => item.id === data.id)
      : undefined;

    const lastVoiceId = savedTime?.lastVoiceId ?? localHistoryItem?.voiceId;

    if (!lastVoiceId) {
      return;
    }

    const hasLastVoice = data.voices.some((voice) => voice.id === lastVoiceId);

    // Cloud Sync can contain a voice that no longer exists in the current
    // service response. Do not apply stale voice selection.
    const lastVoiceData = hasLastVoice
      ? savedTime?.voices?.[lastVoiceId]
      : undefined;
    const historySelection = localHistoryItem?.voiceId === lastVoiceId
      ? localHistoryItem
      : undefined;

    data.voices = data.voices.map((voice) => {
      const isActive = voice.id === lastVoiceId;

      return {
        ...voice,
        lastEpisodeId: isActive
          ? lastVoiceData?.lastEpisodeId
            ?? historySelection?.episodeId
            ?? voice.lastEpisodeId
          : voice.lastEpisodeId,
        lastSeasonId: isActive
          ? lastVoiceData?.lastSeasonId
            ?? historySelection?.seasonId
            ?? voice.lastSeasonId
          : voice.lastSeasonId,
        isActive,
      };
    });

    // load seasons if they're missing
    const activeVoice = data.voices.find((voice) => voice.isActive)
      ?? (!hasLastVoice ? data.voices[0] : undefined);

    if (data.hasSeasons && activeVoice && !activeVoice.seasons) {
      const playbackAdapter =
        sourcePlaybackRouter.getAdapterForFilmLink(data.link);

      const result = playbackAdapter
        ? await playbackAdapter.getFilmSeasons(data, activeVoice)
        : await currentService.getFilmSeasons(data, activeVoice);

      data.voices = data.voices.map((voice) =>
        voice.id === activeVoice.id
          ? {
              ...voice,
              seasons: result.seasons,
            }
          : voice,
      );
    }
  };

  // useFocusEffect re-runs whenever the callback identity changes, so it has to be
  // memoized - an inline arrow re-subscribes the back handler on every render
  useFocusEffect(useCallback(() => {
    const onBackPress = () => {
      if (isDeepLink) {
        navigation.reset({
          index: 0,
          routes: [{ name: 'Tabs', params: { screen: 'Home-tab' } }],
        });

        return true;
      }

      return false;
    };

    const backHandler = BackHandler.addEventListener('hardwareBackPress', onBackPress);

    return () => {
      backHandler.remove();
    };
  }, [isDeepLink, navigation]));

  const filmQueryKey = useMemo(() => queryKeys.film(link), [link]);

  const { data: film = null, isError: isFilmLoadError, refetch: retryFilmLoad } = useQuery({
    queryKey: filmQueryKey,
    enabled: !!link,
    retry: 0,
    queryFn: async () => {
      const sourceAdapter = sourceRouter.getAdapterForLink(link);
      const sourceFilm = await withDeadline(sourceAdapter
        ? sourceAdapter.getFilm(link)
        : currentService.getFilm(link), 20_000);
      if (!sourceFilm) throw new Error('Не удалось загрузить данные фильма. Повторите попытку.');
      const baseFilm = {
        ...sourceFilm,
        libraryId: isLocalLibrary && libraryFilmId && localBookmarks.films[libraryFilmId]
          ? libraryFilmId : sourceFilm.id,
      };
      if (isLocalLibrary) applyLocalScheduleMarks(baseFilm);
      if (!isSignedIn || isLocalLibrary) await updateFilmVoiceData(baseFilm);
      // Supplemental metadata must not hold the main Zona page behind a spinner.
      queryClient.setQueryData(filmQueryKey, baseFilm);
      const loadedFilm = await sourceRouter.resolvePreferredFilm(baseFilm);
      const liveFilm = queryClient.getQueryData<FilmInterface>(filmQueryKey);
      if (liveFilm?.link === loadedFilm.link) loadedFilm.voices = liveFilm.voices;
      if (isLocalLibrary && loadedFilm) {
        applyLocalScheduleMarks(loadedFilm);
      }

      // in local mode the account watch-state is not updated, so local saved time drives it
      if (!isSignedIn || isLocalLibrary) {
        await updateFilmVoiceData(loadedFilm);
      }

      return loadedFilm;
    },
  });

  // updates the cached film in place so mutation handlers stay the single source of truth
  const updateFilm = useCallback(
    (updater: (prevFilm: FilmInterface | null) => FilmInterface | null) => {
      queryClient.setQueryData<FilmInterface | null>(filmQueryKey, (prevFilm) => updater(prevFilm ?? null));
    },
    [queryClient, filmQueryKey]
  );

  const handleVoicesUpdate = useCallback(
    (voices: FilmVoiceInterface[]) => {
      if (voices.length === 0) {
        return;
      }

      updateFilm((prevFilm) => (
        prevFilm
          ? {
              ...prevFilm,
              voices,
              hasVoices: true,
            }
          : prevFilm
      ));
    },
    [updateFilm],
  );


  const isFilmInRecentQuery = useQuery({
    queryKey: [queryKeys.recent(), link],
    enabled: !!film && !isLocalLibrary && isContinueBtnEnabled,
    queryFn: async () => {
      let page = 1;
      let result = await currentService.getRecent(page);

      while (true) {
        if (result.items.some((item) => item.link === link)) {
          return true;
        }

        if (page >= result.totalPages) {
          return false;
        }

        page += 1;
        result = await currentService.getRecent(page);
      }
    },
  });

  const isFilmInRecent = useMemo(() => {
    if (!film || !isContinueBtnEnabled) {
      return false;
    }

    if (isLocalLibrary) {
      return localHistory.some((item) => item.link === link);
    }

    return isFilmInRecentQuery.data === true;
  }, [
    film,
    isContinueBtnEnabled,
    isLocalLibrary,
    isFilmInRecentQuery.data,
    link,
    localHistory,
  ]);

  // in local mode film.bookmarks is derived reactively from the local store, so the
  // bookmark button and overlay stay in sync with local writes (including the overlay's own)
  const filmValue = useMemo(() => {
    if (!film || !isLocalLibrary) {
      return film;
    }

    return { ...film, bookmarks: getLocalBookmarksForFilm(localBookmarks, film.libraryId ?? film.id) };
  }, [film, isLocalLibrary, localBookmarks]);

  const handleVideoSelect = (video: FilmVideoInterface, voice: FilmVoiceInterface, quality?: string) => {
    RouterStore.pushData(PLAYER_SCREEN, {
      video,
      film,
      voice,
      quality,
    });

    navigate(PLAYER_SCREEN);

    playerVideoSelectorOverlayRef.current?.close();
  };

  const openVideoDownloader = useCallback(async () => {
    if (!film) {
      return;
    }

    playerVideoDownloaderOverlayRef.current?.open();
  }, [film]);

  const playFilm = () => {
    if (!film) {
      return;
    }

    const { voices } = film;

    if (voices.length <= 0) {
      NotificationStore.displayMessage(t('No video available'));

      return;
    }

    playerVideoSelectorOverlayRef.current?.open();
  };

  const handleSelectFilm = useCallback((f: FilmInterface) => {
    openFilm(f, navigation);
  }, [navigation]);

  const handleSelectActor = useCallback((actorLink: string) => {
    if (!actorLink) {
      NotificationStore.displayMessage('Страница этого человека недоступна в подключённых источниках');
      return;
    }
    openActor(actorLink, navigation);
  }, [navigation]);

  const handleSelectCategory = useCallback((categoryLink: string) => {
    openCategory(categoryLink, navigation);
  }, [navigation]);

  const visibleScheduleItems = useMemo(() => {
    if (!film) {
      return [];
    }

    const { schedule = [] } = film;

    if (!schedule.length) {
      return [];
    }

    const { items } = schedule[0];

    const initialItems = items.reduce<ScheduleItemInterface[]>((acc, item) => {
      if (!item.isReleased) {
        acc.push(item);
      } else if (acc.length < MINIMUM_SCHEDULE_ITEMS) {
        acc.push(item);
      }

      return acc;
    }, []);

    return initialItems;
  }, [film]);

  const { mutate: saveScheduleWatch } = useMutation({
    mutationFn: (scheduleItemId: string) => currentService.saveScheduleWatch(scheduleItemId),
  });

  const handleUpdateScheduleWatch = useCallback(async (scheduleItem: ScheduleItemInterface) => {
    const { id, isWatched } = scheduleItem;

    if (isLocalLibrary) {
      if (!film) {
        return false;
      }

      setLocalScheduleMark(film.id, id, !isWatched);
    } else {
      if (!isSignedIn) {
        NotificationStore.displayMessage(t('Sign In to an Account'));

        return false;
      }

      saveScheduleWatch(id);
    }

    updateFilm((prevFilm) => {
      if (!prevFilm) {
        return prevFilm;
      }

      const { schedule = [] } = prevFilm;

      const newSchedule = schedule.map((s) => {
        return {
          ...s,
          items: s.items.map((i) => {
            if (i.id === id) {
              return { ...i, isWatched: !i.isWatched };
            }

            return i;
          }),
        };
      });

      return {
        ...prevFilm,
        schedule: newSchedule,
      };
    });

    return true;
  }, [isSignedIn, isLocalLibrary, saveScheduleWatch, film, updateFilm]);

  const handleShare = async () => {
    if (!film) {
      return;
    }

    try {
      await Share.share({
        message: prepareShareBody(film),
      });
    } catch (error) {
      NotificationStore.displayError(error as Error);
    }
  };

  const openBookmarks = () => {
    if (!isSignedIn && !isLocalLibrary) {
      NotificationStore.displayMessage(t('Sign In to an Account'));

      return;
    }

    bookmarksOverlayRef.current?.open();
  };

  const handleDownloadSelect = async (links: DownloadLinkInterface[]) => {
    if (!film) {
      return;
    }

    const { id, title, poster } = film;
    const filmName = [normalizeName(title), id];
    const folderName = filmName.join('-');
    const folderPath = `${getDownloadsDir(downloadsPath)}/${folderName}`;

    const posterExtension = getUrlExtension(poster, 'jpg');
    const posterDestination = `${folderPath}/poster.${posterExtension}`;

    if (downloadsSavePoster && poster) {
      const posterTask = createDownloadTask({
        id: uuid(),
        url: poster,
        destination: posterDestination,
        metadata: {
          groupId: id,
          groupName: title,
        },
      })
        .done(() => {
          completeHandler(posterTask.id);
        })
        .error(({ error }) => {
          // The poster is not listed as a task on the downloads screen, so this
          // notification is the only place its failure ever surfaces.
          NotificationStore.displayError(t('Poster download failed: {{error}}', { error: String(error) }));
          completeHandler(posterTask.id);
        });

      posterTask.start();
    }

    links.forEach((linkItem) => {
      const { url, quality, headers, subtitles = [], seasonId, episodeId, voice } = linkItem;
      const taskName = [];

      if (seasonId) {
        taskName.push(`S${seasonId}`);
      }

      if (episodeId) {
        taskName.push(`E${episodeId}`);
      }

      taskName.push(quality);

      const name = [...taskName, ...filmName].join('-');
      const taskUrl = url.replace(':hls:manifest.m3u8', '');
      const extension = getUrlExtension(taskUrl, 'mp4');
      const destination = `${folderPath}/${name}.${extension}`;

      const allSubtitles = [];
      if (downloadsSaveSubtitles) {
        const subtitleLinks = subtitles.map((subtitle) => {
          const { url: subtitleUrl, languageCode } = subtitle;

          if (!languageCode) {
            return {
              ...subtitle,
              originalUrl: null,
            };
          }

          const subtitleExtension = getUrlExtension(subtitleUrl, 'vtt');
          const subtitleDestination = `${folderPath}/${name}-${languageCode}.${subtitleExtension}`;

          return {
            ...subtitle,
            url: subtitleDestination,
            originalUrl: subtitleUrl,
          };
        });

        allSubtitles.push(...subtitleLinks);

        subtitleLinks.forEach((subtitle) => {
          const { url: subtitleDestination, originalUrl: subtitleUrl } = subtitle;

          // ignore "off" subtitle
          if (!subtitleUrl) {
            return;
          }

          const subtitleTask = createDownloadTask({
            id: uuid(),
            url: subtitleUrl,
            destination: subtitleDestination,
            metadata: {
              groupId: id,
              groupName: title,
            },
          })
            .done(() => {
              completeHandler(subtitleTask.id);
            })
            .error(({ error }) => {
              // Subtitles are not listed as tasks on the downloads screen either.
              NotificationStore.displayError(t('Subtitles download failed: {{error}}', { error: String(error) }));
              completeHandler(subtitleTask.id);
            });

          subtitleTask.start();
        });
      }

      const task = createDownloadTask({
        id: TaskIdStorage.getOrCreate(destination, {
          url: taskUrl,
          headers,
          destination,
          folder: folderPath,
          film: {
            id,
            link: film.link,
            type: film.type,
            poster: posterDestination,
            title: film.title,
            originalTitle: film.originalTitle,
            releaseDate: film.releaseDate,
            countries: film.countries,
            genres: film.genres,
            voices: film.voices,
            hasVoices: film.hasVoices,
            hasSeasons: film.hasSeasons,
          },
          quality,
          subtitles: allSubtitles,
          seasonId,
          episodeId,
          voiceId: voice?.id,
        }),
        url: taskUrl,
        headers,
        destination,
        metadata: {
          taskFileName: taskName.join(' '),
          destination,
          groupId: id,
          groupName: title,
        },
      })
        .done(() => {
          // The downloads screen clears this too, but only for a task it is
          // rendering -- a film downloaded without ever opening that screen would
          // otherwise stay flagged as half written forever.
          TaskIdStorage.setComplete(destination);
          completeHandler(task.id);
        })
        .error(({ error, errorCode }) => {
          NotificationStore.displayError(getDownloadErrorMessage(error, errorCode));
          completeHandler(task.id);
        });

      task.start();
    });

    NotificationStore.displayMessage(t('Download started'));
  };

  const openTrailerOverlay = () => {
    RouterStore.pushData(FILM_TRAILER_SCREEN, {
      film,
    });

    navigate(FILM_TRAILER_SCREEN);
  };

  const openRatingOverlay = () => {
    ratingOverlayRef.current?.open();
  };

  const openComments = () => {
    commentsOverlayRef.current?.open();
  };

  const openDescription = () => {
    descriptionOverlayRef.current?.open();
  };

  const openSchedule = () => {
    scheduleOverlayRef.current?.open();
  };

  const { mutate: postRating } = useMutation({
    mutationFn: ({ id, rating }: { id: string, rating: number }) => currentService.postRating(id, rating),
    onSuccess: (result) => {
      updateFilm((prevFilm) => {
        if (!prevFilm) {
          return prevFilm;
        }

        return {
          ...prevFilm,
          isRatingPosted: true,
          mainRating: prevFilm.metadataSourceFilm ? prevFilm.mainRating : {
            text: `${result.num} (${result.votes})`,
            name: 'Rezka',
            rating: Number(result.num),
            votes: Number(result.votes),
          },
        };
      });
    },
  });

  const handleRatingSelect = (rating: number) => {
    if (!film) {
      return;
    }

    const ratingFilm = film.metadataSourceFilm ?? film;
    if (/^https?:\/\/[^/]*\.zona\.im\//.test(ratingFilm.link)) {
      NotificationStore.displayMessage('Оценка доступна для фильмов, найденных в HDRezka');
      return;
    }
    postRating({ id: ratingFilm.id, rating });
  };

  const shouldDisplayContinueWatching = isFilmInRecent;

  const {
    mutate: resumeVoice,
    isPending: isContinueWatchingLoading,
  } = useMutation({
    mutationFn: async ({
      voice,
      lastSeasonId,
      lastEpisodeId,
    }: {
      voice: FilmVoiceInterface,
      lastSeasonId?: string,
      lastEpisodeId?: string,
    }) => {
      if (!film) {
        return null;
      }

      const updatedVoice = { ...voice };
      const playbackAdapter =
        sourcePlaybackRouter.getAdapterForFilmLink(film.link);

      if (!film.hasSeasons) {
        // for movies, fetch the video for the voice
        const video = playbackAdapter
          ? await playbackAdapter.getFilmStreamsByVoice(film, voice)
          : await currentService.getFilmStreamsByVoice(film, voice);

        return { video, voice: updatedVoice };
      }

      if (!lastSeasonId || !lastEpisodeId) {
        NotificationStore.displayMessage(t('Current season or episode not saved.'));

        return null;
      }

      // for series, fetch the video for the specific episode
      const video = playbackAdapter
        ? await playbackAdapter.getFilmStreamsByEpisodeId(
            film,
            voice,
            lastSeasonId,
            lastEpisodeId,
          )
        : await currentService.getFilmStreamsByEpisodeId(
            film,
            voice,
            lastSeasonId,
            lastEpisodeId,
          );

      updatedVoice.lastSeasonId = lastSeasonId;
      updatedVoice.lastEpisodeId = lastEpisodeId;

      return { video, voice: updatedVoice };
    },
    onSuccess: (result) => {
      if (!result) {
        return;
      }

      const { video, voice } = result;

      if (!video) {
        NotificationStore.displayMessage(t('No video available'));

        return;
      }

      handleVideoSelect(video, voice, getPlayerQuality());
    },
  });

  const continueWatching = () => {
    if (!film) {
      return;
    }

    const savedTime = getSavedTime(film);

    // If no saved time, just play from the beginning
    if (!savedTime || !savedTime.voices || Object.keys(savedTime.voices).length === 0) {
      playFilm();

      return;
    }

    // Find the last watched voice with saved timestamps
    let lastVoiceId: string | null = null;
    let lastVoiceData = null;

    if (savedTime.lastVoiceId) {
      lastVoiceId = savedTime.lastVoiceId;

      const voiceData = savedTime.voices[lastVoiceId];
      if (voiceData && voiceData.timestamps && Object.keys(voiceData.timestamps).length > 0) {
        lastVoiceData = voiceData;
      }
    }

    // fallback for backward compatibility
    if (!lastVoiceId || !lastVoiceData) {
      for (const voiceId of Object.keys(savedTime.voices)) {
        const voiceData = savedTime.voices[voiceId];

        if (voiceData && voiceData.timestamps && Object.keys(voiceData.timestamps).length > 0) {
          lastVoiceId = voiceId;
          lastVoiceData = voiceData;
          break;
        }
      }
    }

    if (!lastVoiceId || !lastVoiceData) {
      playFilm();

      return;
    }

    // Find the voice object in the film
    let voice = film.voices.find((v) => v.id === lastVoiceId);

    // see RecentScreen.container.tsx for why a lone voice can carry a different id
    if (!voice && film.voices.length === 1) {
      [voice] = film.voices;
    }

    if (!voice) {
      playFilm();

      return;
    }

    resumeVoice({
      voice,
      lastSeasonId: lastVoiceData.lastSeasonId,
      lastEpisodeId: lastVoiceData.lastEpisodeId,
    });
  };

  const containerProps = {
    film: filmValue,
    isLoadError: isFilmLoadError,
    retryLoad: () => { void retryFilmLoad(); },
    thumbnailPoster,
    visibleScheduleItems,
    playerVideoSelectorOverlayRef,
    scheduleOverlayRef,
    commentsOverlayRef,
    bookmarksOverlayRef,
    descriptionOverlayRef,
    playerVideoDownloaderOverlayRef,
    isDeepLink,
    ratingOverlayRef,
    isContinueWatchingLoading,
    showVotesCount,
    showRecommendations,
    showAgeRating,
    playFilm,
    handleVideoSelect,
    handleVoicesUpdate,
    handleSelectFilm,
    handleSelectActor,
    handleSelectCategory,
    handleUpdateScheduleWatch,
    handleShare,
    openBookmarks,
    openVideoDownloader,
    handleDownloadSelect,
    openTrailerOverlay,
    handleRatingSelect,
    openRatingOverlay,
    openComments,
    openDescription,
    openSchedule,
    shouldDisplayContinueWatching,
    continueWatching,
  };

  return isTV ? <FilmScreenComponentTV { ...containerProps } /> : <FilmScreenComponent { ...containerProps } />;
}

export default FilmScreenContainer;

