import { collection, CollectionReference, getFirestore } from '@react-native-firebase/firestore';
import { useNavigation } from '@react-navigation/native';
import { PlayerVideoSelectorRef } from 'Component/PlayerVideoSelector/PlayerVideoSelector.container';
import { DropdownItem } from 'Component/ThemedDropdown/ThemedDropdown.type';
import { ThemedOverlayRef } from 'Component/ThemedOverlay/ThemedOverlay.type';
import { useConfigContext } from 'Context/ConfigContext';
import { usePlayerContext } from 'Context/PlayerContext';
import { usePlayerProgressActions } from 'Context/PlayerProgressContext';
import { useServiceContext } from 'Context/ServiceContext';
import { activateKeepAwakeAsync, deactivateKeepAwake } from 'expo-keep-awake';
import { useLocalBookmarks } from 'Hooks/useLocalLibrary';
import { useVideoPlayerState } from 'Hooks/useVideoPlayerState';
import { t } from 'i18n/translate';
import { PLAYER_SCREEN } from 'Navigation/navigationRoutes';
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { BackHandler, Share } from 'react-native';
import {
  BandwidthData,
  onProgressData,
  ResizeMode,
  useEvent,
  useVideoPlayer,
  VideoConfig,
  VideoPlayer,
  VideoRuntimeError,
} from 'react-native-video';
import NotificationStore from 'Store/Notification.store';
import RouterStore from 'Store/Router.store';
import { FilmInterface } from 'Type/Film.interface';
import { FilmVideoInterface, SubtitleInterface } from 'Type/FilmVideo.interface';
import { FilmVoiceInterface } from 'Type/FilmVoice.interface';
import { isBookmarked } from 'Util/Film';
import { createMasterPlaylist, getQualityFromResolution } from 'Util/Hls';
import { upsertLocalHistoryItem } from 'Util/LocalLibrary';
import { setIntervalSafe } from 'Util/Misc';
import {
  applyPlayerRate,
  getBufferConfig,
  getExternalSubtitles,
  getFirestoreSavedTime,
  getFirestoreVideoTime,
  getPlayerMetadata,
  getPlayerQuality,
  getPlayerStream,
  getQualityFromStreams,
  getSavedTime,
  getVideoTime,
  updateFirestoreSavedTime,
  updatePlayerQuality,
  updateSavedTime,
} from 'Util/Player';

import PlayerComponent from './Player.component';
import PlayerComponentTV from './Player.component.atv';
import {
  ASPECT_RATIO_OPTIONS,
  AUTO_QUALITY,
  AWAKE_TAG,
  EMPTY_VIDEO_URL,
  FIRESTORE_DB,
  getAspectRatio,
  MAX_QUALITY,
  RewindDirection,
  SAVE_TIME_EVERY_MS,
  SUBTITLES_OFF,
} from './Player.config';
import {
  FirestoreDocument,
  PlayerContainerProps,
  PlayerVideoTrack,
  SavedTime,
} from './Player.type';

// expo-video emitted a time update once per second (`timeUpdateEventInterval`).
// react-native-video reports progress every 250ms and offers no way to slow it
// down, so the progress fan-out is throttled here to keep the previous cadence.
const PROGRESS_UPDATE_EVERY_MS = 1000;

export function PlayerContainer({
  video,
  film,
  voice,
  isOffline,
  quality: qualityProp,
}: PlayerContainerProps) {
  const {
    isTV,
    isFirestore,
    isLocalLibrary,
    playerSaveQuality,
    playerAutoNextEpisode,
    playerBufferTimeSetting,
    playerBackBufferTimeSetting,
    playerDefaultAspectRatio,
    playerDefaultSpeed,
  } = useConfigContext();
  const navigation = useNavigation();
  const { updateSelectedVoice } = usePlayerContext();
  const { resetProgressStatus, updateProgressStatus } = usePlayerProgressActions();
  const { isSignedIn, profile, currentService, prepareShareBody } = useServiceContext();

  const storedQuality = useMemo(() => qualityProp ?? getPlayerQuality(), [qualityProp]);
  const defaultQuality = useMemo(() => getQualityFromStreams(video, storedQuality), [video, storedQuality]);

  const [selectedVideo, setSelectedVideo] = useState<FilmVideoInterface>(video);
  const [selectedVoice, setSelectedVoice] = useState<FilmVoiceInterface>(voice);
  const [selectedQuality, setSelectedQuality] = useState<string>(defaultQuality);
  const [overlayQuality, setOverlayQuality] = useState<string>(
    storedQuality !== MAX_QUALITY.value ? defaultQuality : MAX_QUALITY.value
  );
  const [selectedSubtitle, setSelectedSubtitle] = useState<SubtitleInterface|undefined>(
    selectedVideo.subtitles?.find(({ isDefault }) => isDefault)
  );
  const [selectedSpeed, setSelectedSpeed] = useState<number>(playerDefaultSpeed);
  const [selectedAspectRatio, setSelectedAspectRatio] = useState<ResizeMode>(
    getAspectRatio(playerDefaultAspectRatio)
  );
  const [isLocked, setIsLocked] = useState<boolean>(false);
  const [isOverlayOpen, setIsOverlayOpen] = useState<boolean>(false);
  const [isFilmBookmarked, setIsFilmBookmarked] = useState<boolean>(isBookmarked(film));
  const [videoSize, setVideoSize] = useState<{ width: number; height: number } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const stopEventsRef = useRef<boolean>(false);
  const updateTimeTimeout = useRef<number | null>(null);
  const lastProgressUpdate = useRef<number>(0);
  // react-native-video exposes the buffered position only through onProgress,
  // there is no property to read it back from the player
  const bufferedPosition = useRef<number>(0);
  const qualityOverlayRef = useRef<ThemedOverlayRef>(null);
  const subtitleOverlayRef = useRef<ThemedOverlayRef>(null);
  const playerVideoSelectorOverlayRef = useRef<PlayerVideoSelectorRef>(null);
  const commentsOverlayRef = useRef<ThemedOverlayRef>(null);
  const bookmarksOverlayRef = useRef<ThemedOverlayRef>(null);
  const speedOverlayRef = useRef<ThemedOverlayRef>(null);

  const firestoreSavedTimeRef = useRef(false);
  const firestoreDb = useMemo(() => (
    isFirestore && isSignedIn && !isOffline && !isLocalLibrary
      ? collection(getFirestore(), FIRESTORE_DB) as CollectionReference<FirestoreDocument>
      : null
  ), [isSignedIn, isFirestore, isOffline, isLocalLibrary]);

  const localBookmarks = useLocalBookmarks();

  // in local mode the bookmark state is derived reactively from the local store
  const isFilmBookmarkedValue = isLocalLibrary
    ? localBookmarks.categories.some((category) => category.filmIds.includes(film.id))
    : isFilmBookmarked;

  // local history mirrors the moments the account receives saveWatch: playback
  // start here, episode/voice change in changePlayerVideo (props are stable for
  // the lifetime of a player session, and the upsert dedupes by film id)
  useEffect(() => {
    if (isLocalLibrary && !isOffline) {
      upsertLocalHistoryItem(film, voice);
    }
  }, [film, voice, isOffline, isLocalLibrary]);

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

  const videoUrl = useMemo(() => {
    if (isOffline) {
      const { url } = getPlayerStream(video, selectedQuality);

      // getPlayerStream reports a miss as a null url, which would become "file://null"
      return url ? `file://${url}` : null;
    }

    if (selectedQuality === AUTO_QUALITY.value) {
      return createMasterPlaylist(video.streams).uri;
    }

    return getPlayerStream(video, selectedQuality).url;
  }, [selectedQuality, video, isOffline]);

  const buildVideoSource = useCallback((
    url: string,
    quality: string,
    videoArg: FilmVideoInterface,
    voiceArg: FilmVoiceInterface
  ): VideoConfig => ({
    uri: url,
    bufferConfig: getBufferConfig(quality, playerBufferTimeSetting, playerBackBufferTimeSetting),
    externalSubtitles: getExternalSubtitles(videoArg, isOffline),
    metadata: getPlayerMetadata(film, voiceArg),
    headers: currentService.getHeaders(),
  }), [
    playerBufferTimeSetting,
    playerBackBufferTimeSetting,
    isOffline,
    film,
    currentService,
  ]);

  const videoSource = useMemo(
    () => buildVideoSource(videoUrl ?? EMPTY_VIDEO_URL, selectedQuality, video, voice),
    [buildVideoSource, videoUrl, selectedQuality, video, voice]
  );

  const player = useVideoPlayer(videoSource, (p) => {
    const savedTime = getSavedTime(film);

    p.loop = false;
    p.currentTime = getVideoTime(selectedVoice, savedTime);
    p.rate = playerDefaultSpeed;
    // hands the player a media session, which is what makes the headset button,
    // the notification and the lock screen controls reach it
    p.showNotificationControls = true;
    p.play();

    initFirestoreSavedTime(p, savedTime);
  });

  const { status, isPlaying } = useVideoPlayerState(player);

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

  const removeUpdateTimeTimeout = useCallback(() => {
    if (updateTimeTimeout.current) {
      clearInterval(updateTimeTimeout.current);
      updateTimeTimeout.current = null;
    }
  }, []);

  const createUpdateTimeTimeout = useCallback(() => {
    removeUpdateTimeTimeout();

    updateTimeTimeout.current = setIntervalSafe(() => {
      try {
        const { isPlaying: playing } = player;

        if (playing) {
          updateTime();
        }
      } catch (error) {
        // the only way to get here is a released player, and this closure holds
        // that same instance - retrying would just repeat the failure. The effect
        // below re-arms the interval as soon as a new player is created.
        console.error('Error updating time:', error);
        removeUpdateTimeTimeout();
      }
    }, SAVE_TIME_EVERY_MS);
  }, [player, updateTime, removeUpdateTimeTimeout]);

  const resetUpdateTimeTimeout = useCallback(() => {
    removeUpdateTimeTimeout();
    createUpdateTimeTimeout();
  }, [removeUpdateTimeTimeout, createUpdateTimeTimeout]);

  const handleBack = useCallback(() => {
    updateTime();
  }, [updateTime]);

  const pausePlayback = useCallback(() => {
    if (!player.isPlaying) {
      return;
    }

    player.pause();
    updateTime();
  }, [player, updateTime]);

  /**
   * Subtitles are handed to the native player as external tracks, so ExoPlayer
   * parses and times them itself. Every external track is flagged as a default
   * one, which means the player picks a subtitle on its own unless the choice is
   * restated - hence the call on every load, not only on user selection.
   */
  const applySubtitle = useCallback((subtitle?: SubtitleInterface) => {
    try {
      const track = subtitle
        ? player.getAvailableTextTracks().find(({ label }) => label === subtitle.name)
        : undefined;

      // re-selecting the track that is already showing rebuilds the whole track
      // selection for nothing, and a rebuffer sends us through here again
      if (track && player.selectedTrack?.id === track.id) {
        return;
      }

      player.selectTextTrack(track ?? null);
    } catch (error) {
      console.error('Error selecting subtitle track:', error);
    }
  }, [player]);

  useEffect(() => {
    activateKeepAwakeAsync(AWAKE_TAG);
    createUpdateTimeTimeout();

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      () => {
        handleBack();

        return false;
      }
    );

    return () => {
      deactivateKeepAwake(AWAKE_TAG);
      removeUpdateTimeTimeout();
      backHandler.remove();
      resetProgressStatus();
    };
  }, [handleBack, createUpdateTimeTimeout, removeUpdateTimeTimeout, resetProgressStatus]);

  // source switching lives above the event subscriptions on purpose: onProgress
  // reaches into this chain to auto-advance episodes, and a handler the player
  // events call has to be declared before them
  const updatePlayerStream = (
    videoArg: FilmVideoInterface,
    qualityArg: string,
    voiceArg: FilmVoiceInterface
  ) => {
    if (qualityArg === AUTO_QUALITY.value) {
      // temporary solution
      // unfortunately it doesn't work because player loading becomes stuck
      // so the only way is to reload the player page entirely
      //player.replaceSourceAsync(createMasterPlaylist(filmVideo.streams).uri);

      RouterStore.pushData(PLAYER_SCREEN, {
        video: videoArg,
        film,
        voice: voiceArg || selectedVoice,
      });

      const state = navigation.getState();
      const filteredRoutes = state?.routes.filter((r) => r.name !== PLAYER_SCREEN) ?? [];
      filteredRoutes.push({
        key: `${PLAYER_SCREEN}-${Date.now()}`,
        name: PLAYER_SCREEN,
      });

      navigation.reset({
        index: state?.index ?? 0,
        routes: filteredRoutes as any,
      });
    } else {
      const newStream = getPlayerStream(videoArg, getQualityFromStreams(videoArg, qualityArg));

      // a miss is reported as a null url, not a missing object
      if (!newStream.url) {
        return;
      }

      player.replaceSourceAsync(
        buildVideoSource(newStream.url, newStream.quality, videoArg, voiceArg || selectedVoice)
      );
    }
  };

  const changePlayerVideo = (newVideo: FilmVideoInterface, newVoice: FilmVoiceInterface) => {
    if (isLocalLibrary) {
      if (!isOffline) {
        upsertLocalHistoryItem(film, newVoice);
      }
    } else if (isSignedIn) {
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

    try {
      setIsLoading(true);

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
    } catch (error) {
      NotificationStore.displayError(error as Error);
    } finally {
      setIsLoading(false);
    }
  };

  const onPlaybackEnd = (currentTime: number, duration: number) => {
    if (!playerAutoNextEpisode) {
      return;
    }

    if (currentTime >= duration - 1) {
      handleNewEpisode(RewindDirection.FORWARD);
    }
  };

  useEvent(player, 'onProgress', ({ currentTime, bufferDuration }: onProgressData) => {
    // bufferDuration is the buffer ahead of the playhead, everything else here
    // works with an absolute position
    bufferedPosition.current = currentTime + bufferDuration;

    if (stopEventsRef.current) {
      return;
    }

    const { duration, isPlaying: playing } = player;

    // an unloaded player reports the duration as NaN
    if (!(duration > 0)) {
      return;
    }

    const now = Date.now();

    if (now - lastProgressUpdate.current < PROGRESS_UPDATE_EVERY_MS) {
      return;
    }

    lastProgressUpdate.current = now;

    updateProgressStatus(currentTime, !isOffline ? bufferedPosition.current : 0, duration);

    if (!playing) {
      return;
    }

    onPlaybackEnd(currentTime, duration);
  });

  useEvent(player, 'onError', (error: VideoRuntimeError) => {
    NotificationStore.displayError(`An error occurred : ${error?.message}`);
  });

  // headphones pulled out or a bluetooth headset walking out of range - carrying
  // on would blast the film out of the device speaker
  useEvent(player, 'onAudioBecomingNoisy', pausePlayback);

  // an incoming call or another app taking over audio. react-native-video only
  // reports the loss, pausing is left to us. Playback is deliberately not
  // resumed on regain - after a call the user decides when to carry on.
  useEvent(player, 'onAudioFocusChange', (hasAudioFocus: boolean) => {
    if (!hasAudioFocus) {
      pausePlayback();
    }
  });

  // there is no video track selection in react-native-video, so the rendered
  // resolution is the only signal about the track that is actually playing
  const updateVideoSize = useCallback((width?: number, height?: number) => {
    if (!width || !height) {
      return;
    }

    setVideoSize((prev) => (
      prev?.width === width && prev?.height === height ? prev : { width, height }
    ));
  }, []);

  useEvent(player, 'onLoad', ({ width, height }) => {
    updateVideoSize(width, height);
    applySubtitle(selectedSubtitle);
  });

  useEvent(player, 'onBandwidthUpdate', ({ width, height }: BandwidthData) => {
    updateVideoSize(width, height);
  });

  const selectedVideoTrack = useMemo<PlayerVideoTrack | null>(() => {
    if (!videoSize) {
      return null;
    }

    const { width, height } = videoSize;

    // outside of auto mode the stream is fixed - showing the negotiated
    // resolution instead of the picked quality would only confuse the user
    return {
      quality: selectedQuality === AUTO_QUALITY.value
        ? getQualityFromResolution(width, height)
        : selectedQuality,
      width,
      height,
    };
  }, [videoSize, selectedQuality]);

  const togglePlayPause = (pause?: boolean, stopEvents?: boolean) => {
    const { isPlaying: playing } = player;

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
    const { duration } = player;

    const newTime = calculateCurrentTime(percent);

    updateProgressStatus(newTime, bufferedPosition.current, duration);

    player.seekTo(newTime);
  };

  const rewindPosition = async (type: RewindDirection, seconds: number) => {
    const { currentTime, duration } = player;

    const seekTime = type === RewindDirection.BACKWARD ? seconds * -1 : seconds;
    const newTime = currentTime + seekTime;

    updateProgressStatus(newTime, bufferedPosition.current, duration);

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
    if (!isSignedIn && !isLocalLibrary) {
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

  const handleQualityChange = (item: DropdownItem) => {
    const { value: quality } = item;

    if (selectedQuality === quality) {
      qualityOverlayRef.current?.close();

      return;
    }

    setOverlayQuality(quality);
    setSelectedQuality(getQualityFromStreams(selectedVideo, quality));

    if (playerSaveQuality) {
      updatePlayerQuality(quality);
    }

    updateTime();
    updatePlayerStream(selectedVideo, quality, selectedVoice);

    qualityOverlayRef.current?.close();
  };

  const handleSubtitleChange = (item: DropdownItem) => {
    const { value: languageCode } = item;

    if ((selectedSubtitle?.languageCode ?? SUBTITLES_OFF.value) === languageCode) {
      subtitleOverlayRef.current?.close();

      return;
    }

    const newSubtitle = languageCode === SUBTITLES_OFF.value
      ? undefined
      : selectedVideo.subtitles?.find((s) => s.languageCode === languageCode);

    if (!newSubtitle && languageCode !== SUBTITLES_OFF.value) {
      return;
    }

    setSelectedSubtitle(newSubtitle);
    applySubtitle(newSubtitle);
    updateTime();

    subtitleOverlayRef.current?.close();
  };

  const handleVideoSelect = (newVideo: FilmVideoInterface, newVoice: FilmVoiceInterface) => {
    playerVideoSelectorOverlayRef.current?.close();
    setSelectedVoice(newVoice);
    changePlayerVideo(newVideo, newVoice);
  };

  const setPlayerRate = (rate = 1) => {
    applyPlayerRate(player, rate);
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

  const handleAspectRatioChange = () => {
    setSelectedAspectRatio((prev) => {
      const currentIndex = ASPECT_RATIO_OPTIONS.findIndex((option) => option === prev);
      const nextIndex = (currentIndex + 1) % ASPECT_RATIO_OPTIONS.length;

      return ASPECT_RATIO_OPTIONS[nextIndex];
    });
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
      NotificationStore.displayError(error as Error);
    }
  };

  const onBookmarkChange = (f: FilmInterface) => {
    // BookmarksOverlay edits the very film object it was handed, so there is
    // nothing to copy over - only the derived flag has to catch up
    setIsFilmBookmarked(isBookmarked(f));
  };

  const backwardToStart = () => {
    seekToPosition(0);
    togglePlayPause(false);
  };

  const handleBackButtonPress = () => {
    handleBack();
    navigation.goBack();
  };

  const containerProps = {
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
    selectedAspectRatio,
    isLocked,
    isOverlayOpen,
    isFilmBookmarked: isFilmBookmarkedValue,
    isOffline,
    overlayQuality,
    isLoading,
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
    handleAspectRatioChange,
    openCommentsOverlay,
    openBookmarksOverlay,
    handleLockControls,
    handleShare,
    closeOverlay,
    onBookmarkChange,
    backwardToStart,
    handleBackButtonPress,
  };

  return isTV ? <PlayerComponentTV { ...containerProps } /> : <PlayerComponent { ...containerProps } />;
}

export default PlayerContainer;
