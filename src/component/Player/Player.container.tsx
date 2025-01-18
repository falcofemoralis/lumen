/* eslint-disable react-compiler/react-compiler */
import { DropdownItem } from 'Component/ThemedDropdown/ThemedDropdown.type';
import { useEventListener } from 'expo';
import { activateKeepAwakeAsync, deactivateKeepAwake } from 'expo-keep-awake';
import { useVideoPlayer } from 'expo-video';
import { withTV } from 'Hooks/withTV';
import { useEffect, useRef, useState } from 'react';
import NotificationStore from 'Store/Notification.store';
import OverlayStore from 'Store/Overlay.store';
import ServiceStore from 'Store/Service.store';
import { FilmVideoInterface } from 'Type/FilmVideo.interface';
import { convertSecondsToTime } from 'Util/Date';

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
} from './Player.config';
import { PlayerContainerProps, ProgressStatus } from './Player.type';

export function PlayerContainer({
  video,
  film,
  voice,
}: PlayerContainerProps) {
  const rewindTimeout = useRef<NodeJS.Timeout | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<FilmVideoInterface>(video);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [progressStatus, setProgressStatus] = useState<ProgressStatus>(DEFAULT_PROGRESS_STATUS);
  const [selectedQuality, setSelectedQuality] = useState<string>(selectedVideo.streams[0].quality);
  const autoRewindCount = useRef<number>(0);
  const autoRewindFactor = useRef<number>(1);

  const player = useVideoPlayer(selectedVideo.streams[0].url, (p) => {
    p.loop = false;
    p.timeUpdateEventInterval = 1;
    p.play();
  });

  useEffect(() => {
    activateKeepAwakeAsync(AWAKE_TAG);

    return () => {
      deactivateKeepAwake(AWAKE_TAG);
    };
  }, []);

  useEventListener(player, 'timeUpdate', ({ currentTime, bufferedPosition }) => {
    const { duration, playing } = player;

    if (!playing) {
      return;
    }

    setProgressStatus(calculateProgress(currentTime, bufferedPosition, duration));
  });

  useEventListener(player, 'playingChange', ({ isPlaying: playing }) => {
    if (isPlaying !== playing) {
      setIsPlaying(playing);
    }
  });

  useEventListener(player, 'statusChange', ({ status: playerStatus }) => {
    const loading = playerStatus === 'loading';

    if (isLoading !== loading) {
      setIsLoading(loading);
    }
  });

  const calculateProgress = (currentTime: number, bufferedPosition: number, duration: number) => ({
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
    player.currentTime = calculateCurrentTime(percent);
  };

  const rewindPosition = async (type: RewindDirection, seconds = DEFAULT_REWIND_SECONDS) => {
    const { currentTime, bufferedPosition, duration } = player;

    const seekTime = type === RewindDirection.Backward ? seconds * -1 : seconds;
    const newTime = currentTime + seekTime;

    setProgressStatus(calculateProgress(newTime, bufferedPosition, duration));

    player.seekBy(seekTime);
  };

  const rewindPositionAuto = (direction: RewindDirection, seconds = DEFAULT_REWIND_SECONDS) => {
    if (rewindTimeout.current) {
      clearInterval(rewindTimeout.current);
      rewindTimeout.current = null;
      autoRewindCount.current = 0;
      autoRewindFactor.current = 1;

      return;
    }

    rewindTimeout.current = setInterval(() => {
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

    const stream = selectedVideo.streams.find((s) => s.quality === quality);

    if (!stream) {
      return;
    }

    setSelectedQuality(quality);

    const { currentTime } = player;
    player.replace(stream.url);
    player.currentTime = currentTime;

    OverlayStore.goToPreviousOverlay();
  };

  const handleNewEpisode = async (direction: RewindDirection) => {
    const { hasSeasons } = film;

    if (!hasSeasons) {
      return;
    }

    const { seasons = [], lastSeasonId, lastEpisodeId } = voice;
    const seasonIndex = seasons.findIndex((s) => s.seasonId === lastSeasonId);

    if (seasonIndex === -1) {
      return;
    }

    const season = seasons[seasonIndex];
    const { episodes = [] } = season;

    const episodeIndex = episodes.findIndex((e) => e.episodeId === lastEpisodeId);

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

      if (newEpisodeIndex > (episodes.length - 1)) {
        newSeasonIndex += 1;

        if (newSeasonIndex > (seasons.length - 1)) {
          return;
        }

        newEpisodeIndex = 0;
      }
    }

    const { seasonId } = seasons[newSeasonIndex];
    const { episodeId } = episodes[newEpisodeIndex];

    const newVideo = await ServiceStore.getCurrentService()
      .getFilmStreamsByEpisodeId(
        film,
        voice,
        seasonId,
        episodeId,
      );

    voice.lastSeasonId = seasonId;
    voice.lastEpisodeId = episodeId;

    ServiceStore.getCurrentService().saveWatch(film, voice)
      .catch((error) => {
        NotificationStore.displayError(error as Error);
      });

    setProgressStatus(DEFAULT_PROGRESS_STATUS);
    setIsLoading(true);
    setSelectedVideo(newVideo);
  };

  const containerProps = () => ({
    player,
    isLoading,
    isPlaying,
    progressStatus,
    video: selectedVideo,
    film,
    voice,
    selectedQuality,
  });

  const containerFunctions = {
    togglePlayPause,
    rewindPosition,
    rewindPositionAuto,
    seekToPosition,
    calculateCurrentTime,
    openQualitySelector,
    handleQualityChange,
    handleNewEpisode,
  };

  return withTV(PlayerComponentTV, PlayerComponent, {
    ...containerProps(),
    ...containerFunctions,
  });
}

export default PlayerContainer;
