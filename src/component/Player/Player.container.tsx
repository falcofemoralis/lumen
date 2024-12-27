/* eslint-disable react-compiler/react-compiler */
import { useEventListener } from 'expo';
import { activateKeepAwakeAsync, deactivateKeepAwake } from 'expo-keep-awake';
import { useVideoPlayer } from 'expo-video';
import { withTV } from 'Hooks/withTV';
import { useEffect, useRef, useState } from 'react';
import { convertSecondsToTime } from 'Util/Date';

import PlayerComponent from './Player.component';
import PlayerComponentTV from './Player.component.atv';
import {
  AWAKE_TAG,
  DEFAULT_AUTO_REWIND_MS,
  DEFAULT_REWIND,
  DEFAULT_STATUS,
  RewindDirection,
} from './Player.config';
import { PlayerContainerProps, Status } from './Player.type';

export function PlayerContainer({
  video,
  film,
}: PlayerContainerProps) {
  const rewindTimeout = useRef<NodeJS.Timeout | null>(null);
  const [status, setStatus] = useState<Status>(DEFAULT_STATUS); // used for rendering component

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
    const { duration } = player;

    setStatus({
      ...status,
      progressPercentage: (currentTime / duration) * 100,
      playablePercentage: (bufferedPosition / duration) * 100,
      currentTime: convertSecondsToTime(currentTime),
      durationTime: convertSecondsToTime(duration),
      remainingTime: convertSecondsToTime(duration - currentTime),
    });
  });

  useEventListener(player, 'playingChange', ({ isPlaying }) => {
    setStatus({
      ...status,
      isPlaying,
    });
  });

  const togglePlayPause = () => {
    const { playing } = player;

    if (playing) {
      player.pause();
    } else {
      player.play();
    }
  };

  const seekToPosition = async (percent: number) => {
    const { duration } = player;

    if (!duration) return;

    player.currentTime = (percent / 100) * duration;
  };

  const rewindPosition = async (type: RewindDirection, seconds = DEFAULT_REWIND) => {
    player.seekBy(type === RewindDirection.Backward ? seconds * -1 : seconds);
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

  const containerProps = () => ({
    player,
    status,
    film,
  });

  const containerFunctions = {
    togglePlayPause,
    rewindPosition,
    rewindPositionAuto,
    seekToPosition,
  };

  return withTV(PlayerComponentTV, PlayerComponent, {
    ...containerProps(),
    ...containerFunctions,
  });
}

export default PlayerContainer;
