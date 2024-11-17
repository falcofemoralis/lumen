import { useEventListener } from 'expo';
import { activateKeepAwakeAsync, deactivateKeepAwake } from 'expo-keep-awake';
import { useVideoPlayer } from 'expo-video';
import { withTV } from 'Hooks/withTV';
import { useEffect, useState } from 'react';
import PlayerComponent from './Player.component';
import PlayerComponentTV from './Player.component.atv';
import { AWAKE_TAG, DEFAULT_STATUS, RewindDirection, TIME_UPDATE_INTERVAL } from './Player.config';
import { PlayerContainerProps, Status } from './Player.type';
import { DEMO_VIDEO } from 'Route/PlayerPage/PlayerPage.config';

export function PlayerContainer(props: PlayerContainerProps) {
  const { uri } = props;
  const [showControls, setShowControls] = useState(false);
  const [status, setStatus] = useState<Status>(DEFAULT_STATUS);
  const player = useVideoPlayer(DEMO_VIDEO, (player) => {
    player.timeUpdateEventInterval = TIME_UPDATE_INTERVAL;
    player.loop = false;
    player.play();
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
    });
  });

  useEventListener(player, 'playingChange', ({ isPlaying }) => {
    console.log('playingChange', isPlaying);
    setStatus({
      ...status,
      isPlaying,
    });
  });

  const toggleControls = () => {
    setShowControls(!showControls);
  };

  const togglePlayPause = () => {
    const { playing } = player;

    if (playing) {
      player.pause();
    } else {
      player.play();
    }
  };

  const rewindPosition = async (type: RewindDirection, seconds = 10) => {
    player.seekBy(type === RewindDirection.Backward ? seconds * -1 : seconds);
  };

  const seekToPosition = async (percent: number) => {
    const { duration } = player;

    if (!duration) return;

    player.currentTime = (percent / 100) * duration;
  };

  const containerProps = () => {
    return {
      player,
      status,
      showControls,
    };
  };

  const containerFunctions = {
    toggleControls,
    togglePlayPause,
    rewindPosition,
    seekToPosition,
  };

  return withTV(PlayerComponentTV, PlayerComponent, {
    ...containerProps(),
    ...containerFunctions,
  });
}

export default PlayerContainer;
