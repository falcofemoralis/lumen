import { DropdownItem } from 'Component/ThemedDropdown/ThemedDropdown.type';
import { useEventListener } from 'expo';
import { activateKeepAwakeAsync, deactivateKeepAwake } from 'expo-keep-awake';
import { useVideoPlayer } from 'expo-video';
import { withTV } from 'Hooks/withTV';
import t from 'i18n/t';
import {
  useEffect, useId, useRef, useState,
} from 'react';
import { BackHandler, Share } from 'react-native';
import NotificationStore from 'Store/Notification.store';
import OverlayStore from 'Store/Overlay.store';
import ServiceStore from 'Store/Service.store';
import { FilmStreamInterface } from 'Type/FilmStream.interface';
import { FilmVideoInterface, SubtitleInterface } from 'Type/FilmVideo.interface';
import { FilmVoiceInterface } from 'Type/FilmVoice.interface';
import { setIntervalSafe } from 'Util/Misc';
import {
  getPlayerStream,
  getPlayerTime,
  prepareShareBody,
  updatePlayerQuality,
  updatePlayerTime,
} from 'Util/Player';

import PlayerComponent from './Player.component';
import PlayerComponentTV from './Player.component.atv';
import {
  AWAKE_TAG,
  DEFAULT_REWIND_SECONDS,
  DEFAULT_SPEED,
  RewindDirection,
  SAVE_TIME_EVERY_MS,
} from './Player.config';
import PlayerStore from './Player.store';
import { PlayerContainerProps } from './Player.type';

export function PlayerContainer({
  video,
  stream,
  film,
  voice,
}: PlayerContainerProps) {
  const [selectedVideo, setSelectedVideo] = useState<FilmVideoInterface>(video);
  const [selectedStream, setSelectedStream] = useState<FilmStreamInterface>(stream);
  const [selectedVoice, setSelectedVoice] = useState<FilmVoiceInterface>(voice);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [selectedQuality, setSelectedQuality] = useState<string>(selectedStream.quality);
  const [selectedSubtitle, setSelectedSubtitle] = useState<SubtitleInterface|undefined>(
    selectedVideo.subtitles?.find(({ isDefault }) => isDefault),
  );
  const [selectedSpeed, setSelectedSpeed] = useState<number>(DEFAULT_SPEED);
  const [isLocked, setIsLocked] = useState<boolean>(false);
  const updateTimeTimeout = useRef<NodeJS.Timeout | null>(null);
  const qualityOverlayId = useId();
  const subtitleOverlayId = useId();
  const playerVideoSelectorOverlayId = useId();
  const commentsOverlayId = useId();
  const bookmarksOverlayId = useId();
  const speedOverlayId = useId();

  const player = useVideoPlayer(selectedStream.url, (p) => {
    p.loop = false;
    p.timeUpdateEventInterval = 1;
    p.currentTime = getPlayerTime(film, selectedVoice);
    p.preservesPitch = true;
    p.play();
  });

  useEffect(() => {
    activateKeepAwakeAsync(AWAKE_TAG);
    createUpdateTimeTimeout();

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      () => {
        updateTime();

        return false;
      },
    );

    return () => {
      deactivateKeepAwake(AWAKE_TAG);
      removeUpdateTimeTimeout();
      backHandler.remove();
    };
  }, []);

  useEventListener(
    player,
    'timeUpdate',
    ({ currentTime, bufferedPosition }) => {
      const { duration, playing } = player;

      if (!playing) {
        return;
      }

      PlayerStore.setProgressStatus(currentTime, bufferedPosition, duration);

      onPlaybackEnd(currentTime, duration);
    },
  );

  useEventListener(player, 'playingChange', ({ isPlaying: playing }) => {
    if (isPlaying !== playing) {
      setIsPlaying(playing);
    }
  });

  useEventListener(player, 'statusChange', ({ status: playerStatus, error }) => {
    const loading = playerStatus === 'loading';

    if (playerStatus === 'error') {
      NotificationStore.displayError(`An error occurred : ${error?.message}`);
    }

    if (isLoading !== loading) {
      setIsLoading(loading);
    }
  });

  const onPlaybackEnd = (currentTime: number, duration: number) => {
    if (currentTime >= duration - 1) {
      handleNewEpisode(RewindDirection.FORWARD);
    }
  };

  const changePlayerVideo = (newVideo: FilmVideoInterface, newVoice: FilmVoiceInterface) => {
    if (ServiceStore.isSignedIn) {
      ServiceStore.getCurrentService().saveWatch(film, newVoice)
        .catch((error) => {
          NotificationStore.displayError(error as Error);
        });
    }

    updateTime();
    PlayerStore.resetProgressStatus();
    setIsLoading(true);
    setSelectedVideo(newVideo);
    setSelectedVoice(newVoice);
    setSelectedStream(getPlayerStream(newVideo));
    resetUpdateTimeTimeout();
    setSelectedSubtitle(newVideo.subtitles?.find(({ isDefault }) => isDefault));

    PlayerStore.setSelectedVoice(film.id, newVoice);
  };

  const togglePlayPause = (pause?: boolean) => {
    const { playing } = player;

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

    PlayerStore.setProgressStatus(newTime, bufferedPosition, duration);

    player.currentTime = newTime;
  };

  const rewindPosition = async (
    type: RewindDirection,
    seconds = DEFAULT_REWIND_SECONDS,
  ) => {
    const { currentTime, bufferedPosition, duration } = player;

    const seekTime = type === RewindDirection.BACKWARD ? seconds * -1 : seconds;
    const newTime = currentTime + seekTime;

    PlayerStore.setProgressStatus(newTime, bufferedPosition, duration);

    player.seekBy(seekTime);
  };

  const openQualitySelector = () => {
    OverlayStore.openOverlay(qualityOverlayId);
  };

  const openSubtitleSelector = () => {
    OverlayStore.openOverlay(subtitleOverlayId);
  };

  const openCommentsOverlay = () => {
    OverlayStore.openOverlay(commentsOverlayId);
  };

  const openBookmarksOverlay = () => {
    OverlayStore.openOverlay(bookmarksOverlayId);
  };

  const openSpeedSelector = () => {
    OverlayStore.openOverlay(speedOverlayId);
  };

  const handleQualityChange = (item: DropdownItem) => {
    const { value: quality } = item;

    if (selectedQuality === quality) {
      OverlayStore.goToPreviousOverlay();

      return;
    }

    const newStream = selectedVideo.streams.find((s) => s.quality === quality);

    if (!newStream) {
      return;
    }

    setSelectedQuality(quality);
    updatePlayerQuality(quality);
    setSelectedStream(newStream);
    updateTime();

    player.replace(newStream.url);

    OverlayStore.goToPreviousOverlay();
  };

  const handleSubtitleChange = (item: DropdownItem) => {
    const { value: languageCode } = item;

    if (selectedSubtitle?.languageCode === languageCode) {
      OverlayStore.goToPreviousOverlay();

      return;
    }

    const newSubtitle = selectedVideo.subtitles?.find((s) => s.languageCode === languageCode);

    if (!newSubtitle) {
      return;
    }

    setSelectedSubtitle(newSubtitle);
    updateTime();

    OverlayStore.goToPreviousOverlay();
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
      (e) => e.episodeId === lastEpisodeId,
    );

    if (episodeIndex === -1) {
      return;
    }

    // eslint-disable-next-line functional/no-let
    let newEpisodeIndex = episodeIndex;
    // eslint-disable-next-line functional/no-let
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

    const newVideo = await ServiceStore.getCurrentService().getFilmStreamsByEpisodeId(
      film,
      selectedVoice,
      seasonId,
      episodeId,
    );

    const newVoice = {
      ...selectedVoice,
      lastSeasonId: seasonId,
      lastEpisodeId: episodeId,
    };

    changePlayerVideo(newVideo, newVoice);
  };

  const createUpdateTimeTimeout = () => {
    updateTimeTimeout.current = setIntervalSafe(() => {
      const { playing } = player;

      if (playing) {
        updateTime();
      }
    }, SAVE_TIME_EVERY_MS);
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

  const updateTime = () => {
    const { currentTime } = player;

    updatePlayerTime(film, selectedVoice, currentTime);
  };

  const openVideoSelector = () => {
    OverlayStore.openOverlay(playerVideoSelectorOverlayId);
  };

  const hideVideoSelector = () => {
    OverlayStore.goToPreviousOverlay();
  };

  const handleVideoSelect = (newVideo: FilmVideoInterface, newVoice: FilmVoiceInterface) => {
    hideVideoSelector();
    setSelectedVoice(newVoice);
    changePlayerVideo(newVideo, newVoice);
  };

  const setPlayerRate = (rate = 1) => {
    player.playbackRate = rate;
  };

  const handleSpeedChange = (item: DropdownItem) => {
    const { value: speed } = item;

    if (String(selectedSpeed) === speed) {
      OverlayStore.goToPreviousOverlay();

      return;
    }

    setSelectedSpeed(Number(speed));
    setPlayerRate(Number(speed));

    OverlayStore.goToPreviousOverlay();
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

  const containerProps = () => ({
    player,
    isLoading,
    isPlaying,
    video: selectedVideo,
    film,
    voice: selectedVoice,
    selectedQuality,
    selectedSubtitle,
    qualityOverlayId,
    subtitleOverlayId,
    playerVideoSelectorOverlayId,
    commentsOverlayId,
    bookmarksOverlayId,
    speedOverlayId,
    selectedSpeed,
    isLocked,
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
    hideVideoSelector,
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
  };

  return withTV(PlayerComponentTV, PlayerComponent, {
    ...containerProps(),
    ...containerFunctions,
  });
}

export default PlayerContainer;
