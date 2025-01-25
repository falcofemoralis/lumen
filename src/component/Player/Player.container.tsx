import { PLAYER_VIDEO_SELECTOR_OVERLAY_ID } from 'Component/PlayerVideoSelector/PlayerVideoSelector.config';
import { DropdownItem } from 'Component/ThemedDropdown/ThemedDropdown.type';
import { useEventListener } from 'expo';
import { activateKeepAwakeAsync, deactivateKeepAwake } from 'expo-keep-awake';
import { useVideoPlayer } from 'expo-video';
import { withTV } from 'Hooks/withTV';
import { useEffect, useRef, useState } from 'react';
import NotificationStore from 'Store/Notification.store';
import OverlayStore from 'Store/Overlay.store';
import ServiceStore from 'Store/Service.store';
import { FilmStreamInterface } from 'Type/FilmStream.interface';
import { FilmVideoInterface } from 'Type/FilmVideo.interface';
import { FilmVoiceInterface } from 'Type/FilmVoice.interface';
import { convertSecondsToTime } from 'Util/Date';
import {
  getPlayerStream,
  getPlayerTime,
  updatePlayerQuality,
  updatePlayerTime,
} from 'Util/Player';

import PlayerComponent from './Player.component';
import PlayerComponentTV from './Player.component.atv';
import {
  AWAKE_TAG,
  DEFAULT_AUTO_REWIND_COUNT,
  DEFAULT_AUTO_REWIND_MS,
  DEFAULT_PROGRESS_STATUS,
  DEFAULT_REWIND_SECONDS,
  QUALITY_OVERLAY_ID,
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
  const autoRewindTimeout = useRef<NodeJS.Timeout | null>(null);
  const autoRewindCount = useRef<number>(0);
  const autoRewindFactor = useRef<number>(1);
  const updateTimeTimeout = useRef<NodeJS.Timeout | null>(null);

  const player = useVideoPlayer(selectedStream.url, (p) => {
    p.loop = false;
    p.timeUpdateEventInterval = 1;
    p.currentTime = getPlayerTime(film, selectedVoice);
    p.play();
  });

  useEffect(() => {
    activateKeepAwakeAsync(AWAKE_TAG);
    createUpdateTimeTimeout();

    return () => {
      deactivateKeepAwake(AWAKE_TAG);
      removeUpdateTimeTimeout();
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

      PlayerStore.setProgressStatus(
        calculateProgress(currentTime, bufferedPosition, duration),
      );
    },
  );

  useEventListener(player, 'playingChange', ({ isPlaying: playing }) => {
    if (isPlaying !== playing) {
      setIsPlaying(playing);
    }
  });

  useEventListener(player, 'statusChange', ({ status: playerStatus }) => {
    const loading = playerStatus === 'loading';

    if (playerStatus === 'error') {
      NotificationStore.displayError('An error occurred while loading the video');
    }

    if (isLoading !== loading) {
      setIsLoading(loading);
    }
  });

  const changePlayerVideo = (newVideo: FilmVideoInterface, newVoice: FilmVoiceInterface) => {
    if (ServiceStore.isSignedIn) {
      ServiceStore.getCurrentService().saveWatch(film, newVoice)
        .catch((error) => {
          NotificationStore.displayError(error as Error);
        });
    }

    PlayerStore.setProgressStatus(DEFAULT_PROGRESS_STATUS);
    setIsLoading(true);
    setSelectedVideo(newVideo);
    setSelectedStream(getPlayerStream(newVideo));
    resetUpdateTimeTimeout();
  };

  const calculateProgress = (
    currentTime: number,
    bufferedPosition: number,
    duration: number,
  ) => ({
    progressPercentage: (currentTime / duration) * 100,
    playablePercentage: (bufferedPosition / duration) * 100,
    currentTime: convertSecondsToTime(currentTime),
    durationTime: convertSecondsToTime(duration),
    remainingTime: convertSecondsToTime(duration - currentTime),
  });

  const togglePlayPause = () => {
    const { playing } = player;

    if (playing) {
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

    PlayerStore.setProgressStatus(calculateProgress(newTime, bufferedPosition, duration));

    player.currentTime = newTime;
  };

  const rewindPosition = async (
    type: RewindDirection,
    seconds = DEFAULT_REWIND_SECONDS,
  ) => {
    const { currentTime, bufferedPosition, duration } = player;

    const seekTime = type === RewindDirection.Backward ? seconds * -1 : seconds;
    const newTime = currentTime + seekTime;

    PlayerStore.setProgressStatus(calculateProgress(newTime, bufferedPosition, duration));

    player.seekBy(seekTime);
  };

  const rewindPositionAuto = (
    direction: RewindDirection,
    seconds = DEFAULT_REWIND_SECONDS,
  ) => {
    if (autoRewindTimeout.current) {
      clearInterval(autoRewindTimeout.current);
      autoRewindTimeout.current = null;
      autoRewindCount.current = 0;
      autoRewindFactor.current = 1;

      return;
    }

    autoRewindTimeout.current = setInterval(() => {
      autoRewindCount.current += 1;

      if (autoRewindCount.current >= DEFAULT_AUTO_REWIND_COUNT) {
        autoRewindCount.current = 0;
        autoRewindFactor.current += 1;
      }

      rewindPosition(direction, seconds * autoRewindFactor.current);
    }, DEFAULT_AUTO_REWIND_MS);
  };

  const openQualitySelector = () => {
    OverlayStore.openOverlay(QUALITY_OVERLAY_ID);
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

    if (direction === RewindDirection.Backward) {
      newEpisodeIndex -= 1;

      if (newEpisodeIndex < 0) {
        newSeasonIndex -= 1;

        if (newSeasonIndex < 0) {
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

    selectedVoice.lastSeasonId = seasonId;
    selectedVoice.lastEpisodeId = episodeId;

    changePlayerVideo(newVideo, selectedVoice);
  };

  const createUpdateTimeTimeout = () => {
    updateTimeTimeout.current = setInterval(() => {
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
    OverlayStore.openOverlay(PLAYER_VIDEO_SELECTOR_OVERLAY_ID);
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

  const containerProps = () => ({
    player,
    isLoading,
    isPlaying,
    video: selectedVideo,
    film,
    voice,
    selectedQuality,
  });

  console.log('render PlayerContainer');

  const containerFunctions = {
    togglePlayPause,
    rewindPosition,
    rewindPositionAuto,
    seekToPosition,
    calculateCurrentTime,
    openQualitySelector,
    handleQualityChange,
    handleNewEpisode,
    openVideoSelector,
    hideVideoSelector,
    handleVideoSelect,
    setPlayerRate,
  };

  return withTV(PlayerComponentTV, PlayerComponent, {
    ...containerProps(),
    ...containerFunctions,
  });
}

export default PlayerContainer;
