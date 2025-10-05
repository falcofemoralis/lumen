/* eslint-disable react-compiler/react-compiler */
import { getFirestore } from '@react-native-firebase/firestore';
import { useNavigation } from '@react-navigation/native';
import { DropdownItem } from 'Component/ThemedDropdown/ThemedDropdown.type';
import { ThemedOverlayRef } from 'Component/ThemedOverlay/ThemedOverlay.type';
import { usePlayerContext } from 'Context/PlayerContext';
import { usePlayerProgressActions } from 'Context/PlayerProgressContext';
import { useServiceContext } from 'Context/ServiceContext';
import { useEvent, useEventListener } from 'expo';
import { activateKeepAwakeAsync, deactivateKeepAwake } from 'expo-keep-awake';
import { useVideoPlayer, VideoPlayer, VideoTrack } from 'expo-video';
import { withTV } from 'Hooks/withTV';
import t from 'i18n/t';
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { BackHandler, Share } from 'react-native';
import { PLAYER_ROUTE } from 'Route/PlayerPage/PlayerPage.config';
import ConfigStore from 'Store/Config.store';
import LoggerStore from 'Store/Logger.store';
import NotificationStore from 'Store/Notification.store';
import RouterStore from 'Store/Router.store';
import { FilmInterface } from 'Type/Film.interface';
import { FilmVideoInterface, SubtitleInterface } from 'Type/FilmVideo.interface';
import { FilmVoiceInterface } from 'Type/FilmVoice.interface';
import { isBookmarked } from 'Util/Film';
import { createMasterPlaylist, getQualityFromResolution } from 'Util/Hls';
import { setIntervalSafe } from 'Util/Misc';
import {
  getBufferTime,
  getFirestoreSavedTime,
  getFirestoreVideoTime,
  getPlayerQuality,
  getPlayerStream,
  getSavedTime,
  getVideoTime,
  prepareShareBody,
  updateFirestoreSavedTime,
  updatePlayerQuality,
  updateSavedTime,
} from 'Util/Player';

import PlayerComponent from './Player.component';
import PlayerComponentTV from './Player.component.atv';
import {
  AUTO_QUALITY,
  AWAKE_TAG,
  DEFAULT_SPEED,
  FIRESTORE_DB,
  MAX_QUALITY,
  RewindDirection,
  SAVE_TIME_EVERY_MS,
} from './Player.config';
import { FirestoreDocument, PlayerContainerProps, SavedTime } from './Player.type';

export function PlayerContainer({
  video,
  film,
  voice,
}: PlayerContainerProps) {
  const navigation = useNavigation();
  const { updateSelectedVoice } = usePlayerContext();
  const { resetProgressStatus, updateProgressStatus } = usePlayerProgressActions();
  const { isSignedIn, profile, currentService } = useServiceContext();
  const [selectedVideo, setSelectedVideo] = useState<FilmVideoInterface>(video);
  const [selectedVoice, setSelectedVoice] = useState<FilmVoiceInterface>(voice);
  const [selectedQuality, setSelectedQuality] = useState<string>(getPlayerQuality(video));
  const [selectedSubtitle, setSelectedSubtitle] = useState<SubtitleInterface|undefined>(
    selectedVideo.subtitles?.find(({ isDefault }) => isDefault)
  );
  const [selectedSpeed, setSelectedSpeed] = useState<number>(DEFAULT_SPEED);
  const [isLocked, setIsLocked] = useState<boolean>(false);
  const [isOverlayOpen, setIsOverlayOpen] = useState<boolean>(false);
  const [isFilmBookmarked, setIsFilmBookmarked] = useState<boolean>(isBookmarked(film));
  const [selectedVideoTrack, setSelectedVideoTrack] = useState<VideoTrack | null>(null);

  const stopEventsRef = useRef<boolean>(false);
  const updateTimeTimeout = useRef<NodeJS.Timeout | null>(null);
  const qualityOverlayRef = useRef<ThemedOverlayRef>(null);
  const subtitleOverlayRef = useRef<ThemedOverlayRef>(null);
  const playerVideoSelectorOverlayRef = useRef<ThemedOverlayRef>(null);
  const commentsOverlayRef = useRef<ThemedOverlayRef>(null);
  const bookmarksOverlayRef = useRef<ThemedOverlayRef>(null);
  const speedOverlayRef = useRef<ThemedOverlayRef>(null);

  const firestoreSavedTimeRef = useRef(false);
  const firestoreDb = useMemo(() => (
    ConfigStore.getConfig().isFirestore && isSignedIn
      ? getFirestore().collection<FirestoreDocument>(FIRESTORE_DB)
      : null
  ), [isSignedIn]);

  const initFirestoreSavedTime = useCallback(async (p: VideoPlayer, savedTime: SavedTime | null) => {
    if (firestoreSavedTimeRef.current || !firestoreDb || !profile) {
      return;
    }

    firestoreSavedTimeRef.current = true;
    const fireStoreSavedTime = await getFirestoreSavedTime(film, profile, firestoreDb);

    if (fireStoreSavedTime) {
      const time = getFirestoreVideoTime(selectedVoice, fireStoreSavedTime, savedTime);

      if (time) {
        p.currentTime = time;
      }
    }
  }, [firestoreDb, profile, film, selectedVoice]);

  const player = useVideoPlayer(selectedQuality !== AUTO_QUALITY.value ? getPlayerStream(video)?.url : null, (p) => {
    const savedTime = getSavedTime(film);

    p.loop = false;
    p.timeUpdateEventInterval = 1;
    p.currentTime = getVideoTime(selectedVoice, savedTime);
    p.preservesPitch = true;
    p.bufferOptions = {
      ...p.bufferOptions,
      preferredForwardBufferDuration: getBufferTime(selectedQuality),
    };
    p.play();

    initFirestoreSavedTime(p, savedTime);
  });

  const { isPlaying } = useEvent(player, 'playingChange', { isPlaying: player.playing });
  const { status } = useEvent(player, 'statusChange', { status: player.status });

  const updateTime = useCallback(() => {
    const { currentTime, duration } = player;
    if (!duration) {
      // video is not loaded yet, do not update time to avoid progress being null
      return;
    }

    const progress = (currentTime / duration) * 100;

    updateSavedTime(film, selectedVoice, currentTime, progress);

    if (firestoreDb && profile) {
      updateFirestoreSavedTime(
        film,
        selectedVoice,
        profile,
        firestoreDb,
        currentTime,
        progress
      );
    }
  }, [player, selectedVoice, firestoreDb, profile, film]);

  const createUpdateTimeTimeout = useCallback(() => {
    if (updateTimeTimeout.current) {
      clearInterval(updateTimeTimeout.current);
      updateTimeTimeout.current = null;
    }

    updateTimeTimeout.current = setIntervalSafe(() => {
      try {
        const { playing } = player;

        if (playing) {
          updateTime();
        }
      } catch (error) {
        LoggerStore.error('createUpdateTimeTimeout', { error });

        // If we get an error accessing the player, reset the timeout
        createUpdateTimeTimeout();
      }
    }, SAVE_TIME_EVERY_MS);
  }, [player, updateTime]);

  useEffect(() => {
    if (selectedQuality === AUTO_QUALITY.value) {
      player.replaceAsync(createMasterPlaylist(selectedVideo.streams));
    }
  }, []);

  useEffect(() => {
    activateKeepAwakeAsync(AWAKE_TAG);
    createUpdateTimeTimeout();

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      () => {
        updateTime();

        return false;
      }
    );

    return () => {
      deactivateKeepAwake(AWAKE_TAG);
      removeUpdateTimeTimeout();
      backHandler.remove();
      resetProgressStatus();
    };
  }, [updateTime, createUpdateTimeTimeout, initFirestoreSavedTime, resetProgressStatus]);

  useEventListener(
    player,
    'timeUpdate',
    ({ currentTime, bufferedPosition }) => {
      if (stopEventsRef.current) {
        return;
      }

      const { duration, playing } = player;

      if (duration <= 0) {
        return;
      }

      updateProgressStatus(currentTime, bufferedPosition, duration);

      if (!playing) {
        return;
      }

      onPlaybackEnd(currentTime, duration);
    }
  );

  useEventListener(player, 'statusChange', ({ status: playerStatus, error }) => {
    if (playerStatus === 'error') {
      LoggerStore.error('Player', { error: error?.message });

      NotificationStore.displayError(`An error occurred : ${error?.message}`);
    }
  });

  useEventListener(player, 'videoTrackChange', ({ videoTrack }) => {
    if (!videoTrack) {
      setSelectedVideoTrack(null);

      return;
    }

    // we still can display actual video params, but it will be confusing to the user
    if (selectedQuality === AUTO_QUALITY.value) {
      setSelectedVideoTrack({
        ...videoTrack,
        mimeType: getQualityFromResolution(videoTrack.size.width, videoTrack.size.height),
      });

      return;
    }

    setSelectedVideoTrack({
      ...videoTrack,
      mimeType: selectedQuality,
    });
  });

  const onPlaybackEnd = (currentTime: number, duration: number) => {
    if (currentTime >= duration - 1) {
      handleNewEpisode(RewindDirection.FORWARD);
    }
  };

  const changePlayerVideo = (newVideo: FilmVideoInterface, newVoice: FilmVoiceInterface) => {
    if (isSignedIn) {
      currentService.saveWatch(film, newVoice)
        .catch((error) => {
          NotificationStore.displayError(error as Error);
        });
    }

    updateTime();
    resetProgressStatus();
    setSelectedVideo(newVideo);
    setSelectedVoice(newVoice);
    resetUpdateTimeTimeout();
    setSelectedSubtitle(newVideo.subtitles?.find(({ isDefault }) => isDefault));
    updateSelectedVoice(film.id, newVoice);
    updatePlayerStream(newVideo, selectedQuality, newVoice);
  };

  const togglePlayPause = (pause?: boolean, stopEvents?: boolean) => {
    const { playing } = player;

    if (stopEvents !== undefined) {
      stopEventsRef.current = stopEvents;
    }

    const newPlaying = pause !== undefined ? pause : playing;

    if (newPlaying) {
      player.pause();
      updateTime();
    } else {
      player.play();
    }
  };

  const calculateCurrentTime = (percent: number) => {
    const { duration } = player;

    if (!duration) return 0;

    return (percent / 100) * duration;
  };

  const seekToPosition = async (percent: number) => {
    const { bufferedPosition, duration } = player;

    const newTime = calculateCurrentTime(percent);

    updateProgressStatus(newTime, bufferedPosition, duration);

    player.currentTime = newTime;
  };

  const rewindPosition = async (type: RewindDirection, seconds: number) => {
    const { currentTime, bufferedPosition, duration } = player;

    const seekTime = type === RewindDirection.BACKWARD ? seconds * -1 : seconds;
    const newTime = currentTime + seekTime;

    updateProgressStatus(newTime, bufferedPosition, duration);

    player.seekBy(seekTime);
  };

  const openOverlay = () => {
    setIsOverlayOpen(true);
  };

  const closeOverlay = () => {
    setIsOverlayOpen(false);
  };

  const openQualitySelector = () => {
    qualityOverlayRef.current?.open();
    openOverlay();
  };

  const openVideoSelector = () => {
    playerVideoSelectorOverlayRef.current?.open();
    openOverlay();
  };

  const openSubtitleSelector = () => {
    subtitleOverlayRef.current?.open();
    openOverlay();
  };

  const openCommentsOverlay = () => {
    commentsOverlayRef.current?.open();
    openOverlay();
  };

  const openBookmarksOverlay = () => {
    if (!isSignedIn) {
      NotificationStore.displayMessage(t('Sign In to an Account'));

      return;
    }

    bookmarksOverlayRef.current?.open();
    openOverlay();
  };

  const openSpeedSelector = () => {
    speedOverlayRef.current?.open();
    openOverlay();
  };

  const updatePlayerStream = (
    videoArg: FilmVideoInterface,
    qualityArg: string,
    voiceArg: FilmVoiceInterface
  ) => {
    if (qualityArg === AUTO_QUALITY.value) {
      // temporary solution
      // unfortunately it doesn't work because player loading becomes stuck
      // so the only way is to reload the player page entirely
      //player.replaceAsync(createMasterPlaylist(filmVideo.streams));

      RouterStore.pushData(PLAYER_ROUTE, {
        video: videoArg,
        film,
        voice: voiceArg || selectedVoice,
      });

      const state = navigation.getState();
      const filteredRoutes = state?.routes.filter((r) => r.name !== PLAYER_ROUTE) ?? [];
      filteredRoutes.push({
        key: `${PLAYER_ROUTE}-${Date.now()}`,
        name: PLAYER_ROUTE,
      });

      navigation.reset({
        index: state?.index ?? 0,
        routes: filteredRoutes as any,
      });
    } else {
      const newStream = qualityArg !== MAX_QUALITY.value
        ? videoArg.streams.find((s) => s.quality === qualityArg)
        : videoArg.streams[videoArg.streams.length - 1];

      if (!newStream) {
        return;
      }

      player.replaceAsync(newStream.url);
    }
  };

  const handleQualityChange = (item: DropdownItem) => {
    const { value: quality } = item;

    if (selectedQuality === quality) {
      qualityOverlayRef.current?.close();

      return;
    }

    setSelectedQuality(quality);
    updatePlayerQuality(quality);
    updateTime();
    updatePlayerStream(selectedVideo, quality, selectedVoice);

    qualityOverlayRef.current?.close();
  };

  const handleSubtitleChange = (item: DropdownItem) => {
    const { value: languageCode } = item;

    if (selectedSubtitle?.languageCode === languageCode) {
      subtitleOverlayRef.current?.close();

      return;
    }

    const newSubtitle = selectedVideo.subtitles?.find((s) => s.languageCode === languageCode);

    if (!newSubtitle) {
      return;
    }

    setSelectedSubtitle(newSubtitle);
    updateTime();

    subtitleOverlayRef.current?.close();
  };

  const handleNewEpisode = async (direction: RewindDirection) => {
    const { hasSeasons } = film;

    if (!hasSeasons) {
      return;
    }

    const { seasons = [], lastSeasonId, lastEpisodeId } = selectedVoice;
    const seasonIndex = seasons.findIndex((s) => s.seasonId === lastSeasonId);

    if (seasonIndex === -1) {
      return;
    }

    const season = seasons[seasonIndex];
    const { episodes = [] } = season;

    const episodeIndex = episodes.findIndex(
      (e) => e.episodeId === lastEpisodeId
    );

    if (episodeIndex === -1) {
      return;
    }

    let newEpisodeIndex = episodeIndex;
    let newSeasonIndex = seasonIndex;

    if (direction === RewindDirection.BACKWARD) {
      newEpisodeIndex -= 1;

      if (newEpisodeIndex < 0) {
        newSeasonIndex -= 1;

        if (newSeasonIndex < 0) {
          NotificationStore.displayMessage(t('No more episodes available'));

          return;
        }

        const { episodes: np = [] } = seasons[newSeasonIndex];

        newEpisodeIndex = np.length - 1;
      }
    } else {
      newEpisodeIndex += 1;

      if (newEpisodeIndex > episodes.length - 1) {
        newSeasonIndex += 1;

        if (newSeasonIndex > seasons.length - 1) {
          NotificationStore.displayMessage(t('No more episodes available'));

          return;
        }

        newEpisodeIndex = 0;
      }
    }

    const { seasonId } = seasons[newSeasonIndex];
    const { episodeId } = episodes[newEpisodeIndex];

    const newVideo = await currentService.getFilmStreamsByEpisodeId(
      film,
      selectedVoice,
      seasonId,
      episodeId
    );

    const newVoice = {
      ...selectedVoice,
      lastSeasonId: seasonId,
      lastEpisodeId: episodeId,
    };

    changePlayerVideo(newVideo, newVoice);
  };

  const removeUpdateTimeTimeout = () => {
    if (updateTimeTimeout.current) {
      clearInterval(updateTimeTimeout.current);
      updateTimeTimeout.current = null;
    }
  };

  const resetUpdateTimeTimeout = () => {
    removeUpdateTimeTimeout();
    createUpdateTimeTimeout();
  };

  const handleVideoSelect = (newVideo: FilmVideoInterface, newVoice: FilmVoiceInterface) => {
    playerVideoSelectorOverlayRef.current?.close();
    setSelectedVoice(newVoice);
    changePlayerVideo(newVideo, newVoice);
  };

  const setPlayerRate = (rate = 1) => {
    player.playbackRate = rate;
  };

  const handleSpeedChange = (item: DropdownItem) => {
    const { value: speed } = item;

    if (String(selectedSpeed) === speed) {
      speedOverlayRef.current?.close();

      return;
    }

    setSelectedSpeed(Number(speed));
    setPlayerRate(Number(speed));

    speedOverlayRef.current?.close();
  };

  const handleLockControls = () => {
    setIsLocked(!isLocked);
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: prepareShareBody(film),
      });
    } catch (error) {
      LoggerStore.error('handleShare', { error });

      NotificationStore.displayError(error as Error);
    }
  };

  const onBookmarkChange = (f: FilmInterface) => {
    film.bookmarks = f.bookmarks;
    setIsFilmBookmarked(isBookmarked(film));
  };

  const backwardToStart = () => {
    seekToPosition(0);
    togglePlayPause(false);
  };

  const containerProps = () => ({
    player,
    status,
    isPlaying,
    video: selectedVideo,
    film,
    voice: selectedVoice,
    videoTrack: selectedVideoTrack,
    selectedQuality,
    selectedSubtitle,
    qualityOverlayRef,
    subtitleOverlayRef,
    playerVideoSelectorOverlayRef,
    commentsOverlayRef,
    bookmarksOverlayRef,
    speedOverlayRef,
    selectedSpeed,
    isLocked,
    isOverlayOpen,
    isFilmBookmarked,
  });

  const containerFunctions = {
    togglePlayPause,
    rewindPosition,
    seekToPosition,
    calculateCurrentTime,
    openQualitySelector,
    handleQualityChange,
    handleNewEpisode,
    openVideoSelector,
    handleVideoSelect,
    setPlayerRate,
    openSubtitleSelector,
    handleSubtitleChange,
    handleSpeedChange,
    openSpeedSelector,
    openCommentsOverlay,
    openBookmarksOverlay,
    handleLockControls,
    handleShare,
    closeOverlay,
    onBookmarkChange,
    backwardToStart,
  };

  return withTV(PlayerComponentTV, PlayerComponent, {
    ...containerProps(),
    ...containerFunctions,
  });
}

export default PlayerContainer;
