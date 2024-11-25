import { activateKeepAwakeAsync, deactivateKeepAwake } from 'expo-keep-awake';
import { Video } from 'expo-av';
import { withTV } from 'Hooks/withTV';
import { useEffect, useRef, useState } from 'react';
import PlayerComponent from './Player.component';
import PlayerComponentTV from './Player.component.atv';
import { AWAKE_TAG, DEFAULT_STATUS, RewindDirection } from './Player.config';
import { PlayerContainerProps, Status } from './Player.type';
import NotificationStore from 'Store/Notification.store';

export function PlayerContainer(props: PlayerContainerProps) {
  const { uri } = props;
  const playerRef = useRef<Video>(null);
  const [status, setStatus] = useState<Status>(DEFAULT_STATUS);
  const [showControls, setShowControls] = useState(false);

  useEffect(() => {
    activateKeepAwakeAsync(AWAKE_TAG);

    return () => {
      deactivateKeepAwake(AWAKE_TAG);
    };
  }, []);

  const onPlaybackStatusUpdate = async (newStatus: Status) => {
    if (!newStatus) {
      return;
    }

    if (newStatus?.error) {
      NotificationStore.displayError(newStatus.error);
      return;
    }

    if (!playerRef) {
      return;
    }

    if (newStatus?.isLoaded) {
      if (
        newStatus.durationMillis &&
        newStatus.positionMillis &&
        newStatus.playableDurationMillis
      ) {
        const progressPercentage = (newStatus.positionMillis / newStatus.durationMillis) * 100;
        const playablePercentage =
          (newStatus.playableDurationMillis / newStatus.durationMillis) * 100;
        setStatus({ ...newStatus, progressPercentage, playablePercentage });
      }
    }
  };

  const toggleControls = () => {
    setShowControls(!showControls);
  };

  const togglePlayPause = () => {
    const { isPlaying } = status;

    if (isPlaying) {
      playerRef.current?.pauseAsync();
    } else {
      playerRef.current?.playAsync();
    }
  };

  const rewindPosition = async (type: RewindDirection, ms = 10000) => {
    const position = status.positionMillis;
    const duration = status.durationMillis;

    if (!position || !duration) return;

    if (type === RewindDirection.Backward) {
      if (position < 0) return;
    } else {
      if (position >= duration) return;
    }

    const newPosition = type === RewindDirection.Backward ? position - ms : position + ms;

    playerRef.current?.playFromPositionAsync(newPosition);
  };

  const seekToPosition = async (percent: number) => {
    const duration = status.durationMillis;

    if (!duration) return;

    const newPosition = (percent / 100) * duration;

    playerRef.current?.playFromPositionAsync(newPosition);
  };

  const containerProps = () => {
    return {
      uri,
      playerRef,
      status,
      showControls,
    };
  };

  const containerFunctions = {
    onPlaybackStatusUpdate,
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
