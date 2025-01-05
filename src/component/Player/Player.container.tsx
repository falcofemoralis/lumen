/* eslint-disable react-compiler/react-compiler */
import { DropdownItem } from 'Component/ThemedDropdown/ThemedDropdown.type';
import { useEventListener } from 'expo';
import { activateKeepAwakeAsync, deactivateKeepAwake } from 'expo-keep-awake';
import { useVideoPlayer } from 'expo-video';
import { withTV } from 'Hooks/withTV';
import { useEffect, useRef, useState } from 'react';
import OverlayStore from 'Store/Overlay.store';
import { convertSecondsToTime } from 'Util/Date';

import PlayerComponent from './Player.component';
import PlayerComponentTV from './Player.component.atv';
import {
  AWAKE_TAG,
  DEFAULT_AUTO_REWIND_MS,
  DEFAULT_REWIND,
  DEFAULT_STATUS,
  QUALITY_OVERLAY_ID,
  RewindDirection,
} from './Player.config';
import { PlayerContainerProps, Status } from './Player.type';

export function PlayerContainer({
  video,
  film,
  voice,
}: PlayerContainerProps) {
  const rewindTimeout = useRef<NodeJS.Timeout | null>(null);
  const [status, setStatus] = useState<Status>(DEFAULT_STATUS);
  const [selectedQuality, setSelectedQuality] = useState<string>(video.streams[0].quality);

  const player = useVideoPlayer(video.streams[0].url, (p) => {
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

    setStatus({
      ...status,
      ...calculateProgress(currentTime, bufferedPosition, duration),
    });
  });

  useEventListener(player, 'playingChange', ({ isPlaying }) => {
    setStatus({
      ...status,
      isPlaying,
    });
  });

  useEventListener(player, 'statusChange', ({ status: playerStatus }) => {
    setStatus({
      ...status,
      isLoading: playerStatus === 'loading',
    });
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

  const rewindPosition = async (type: RewindDirection, seconds = DEFAULT_REWIND) => {
    const { currentTime, bufferedPosition, duration } = player;

    const seekTime = type === RewindDirection.Backward ? seconds * -1 : seconds;
    const newTime = currentTime + seekTime;

    setStatus({
      ...status,
      ...calculateProgress(newTime, bufferedPosition, duration),
    });

    player.seekBy(seekTime);
  };

  const rewindPositionAuto = (direction: RewindDirection, seconds = DEFAULT_REWIND) => {
    if (rewindTimeout.current) {
      clearInterval(rewindTimeout.current);
      rewindTimeout.current = null;

      return;
    }

    rewindTimeout.current = setInterval(() => {
      rewindPosition(direction, seconds);
    }, DEFAULT_AUTO_REWIND_MS);
  };

  const openQualitySelector = () => {
    OverlayStore.openOverlay(QUALITY_OVERLAY_ID);
  };

  const handleQualityChange = (item: DropdownItem) => {
    const { value: quality } = item;

    const stream = video.streams.find((s) => s.quality === quality);

    if (!stream) {
      return;
    }

    setSelectedQuality(quality);

    const { currentTime } = player;
    player.replace(stream.url);
    player.currentTime = currentTime;

    OverlayStore.goToPreviousOverlay();
  };

  const containerProps = () => ({
    player,
    status,
    video,
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
  };

  return withTV(PlayerComponentTV, PlayerComponent, {
    ...containerProps(),
    ...containerFunctions,
  });
}

export default PlayerContainer;
