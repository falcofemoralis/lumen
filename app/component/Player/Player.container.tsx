import { activateKeepAwakeAsync, deactivateKeepAwake } from 'expo-keep-awake';
import { Video } from 'expo-av';
import { withTV } from 'Hooks/withTV';
import { useEffect, useRef, useState } from 'react';
import PlayerComponent from './Player.component';
import PlayerComponentTV from './Player.component.atv';
import {
  AWAKE_TAG,
  DEFAULT_AUTO_REWIND_MS,
  DEFAULT_REWIND_MS,
  DEFAULT_STATUS,
  RewindDirection,
} from './Player.config';
import { PlayerContainerProps, Status } from './Player.type';
import NotificationStore from 'Store/Notification.store';

export function PlayerContainer(props: PlayerContainerProps) {
  const { uri } = props;
  const playerRef = useRef<Video>(null);
  const statusRef = useRef<Status | null>(null); // used fur async operation
  const rewindTimeout = useRef<NodeJS.Timeout | null>(null);
  const [status, setStatus] = useState<Status>(DEFAULT_STATUS); // used for rendering component
  const [isPlaying, setIsPlaying] = useState(false);
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

    const {
      isLoaded = false,
      isPlaying = false,
      isBuffering = false,
      durationMillis,
      positionMillis,
      playableDurationMillis,
    } = newStatus ?? {};

    if (isLoaded) {
      if (durationMillis && positionMillis && playableDurationMillis) {
        const progressPercentage = (positionMillis / durationMillis) * 100;
        const playablePercentage = (playableDurationMillis / durationMillis) * 100;
        const updatedStatus = { ...newStatus, progressPercentage, playablePercentage };

        setStatus(updatedStatus);
        statusRef.current = updatedStatus;
      }

      setIsPlaying(isPlaying || isBuffering);
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

  const seekToPosition = async (percent: number) => {
    const { durationMillis: duration } = statusRef.current ?? {};

    if (!duration) return;

    const newPosition = (percent / 100) * duration;

    playerRef.current?.playFromPositionAsync(newPosition);
  };

  const rewindPosition = async (type: RewindDirection, ms = DEFAULT_REWIND_MS) => {
    const { positionMillis: position, durationMillis: duration } = statusRef.current ?? {};

    if (!position || !duration) return;

    if (type === RewindDirection.Backward) {
      if (position < 0) return;
    } else {
      if (position >= duration) return;
    }

    const newPosition = type === RewindDirection.Backward ? position - ms : position + ms;

    playerRef.current?.playFromPositionAsync(newPosition);
  };

  const rewindPositionAuto = (direction: RewindDirection, ms = DEFAULT_REWIND_MS) => {
    if (rewindTimeout.current) {
      clearInterval(rewindTimeout.current);
      rewindTimeout.current = null;
      return;
    }

    rewindTimeout.current = setInterval(() => {
      rewindPosition(direction, ms);
    }, DEFAULT_AUTO_REWIND_MS);
  };

  const containerProps = () => {
    return {
      uri,
      playerRef,
      status,
      isPlaying,
      showControls,
    };
  };

  const containerFunctions = {
    onPlaybackStatusUpdate,
    toggleControls,
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
