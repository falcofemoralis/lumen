import { Video } from 'expo-av';
import { useRef, useState } from 'react';
import AppStore from 'Store/App.store';
import PlayerComponent from './Player.component';
import PlayerComponentTV from './Player.component.atv';
import { DEFAULT_STATUS } from './Player.config';
import { Status } from './Player.type';

export function PlayerContainer() {
  const playerRef = useRef<Video>(null);
  const [status, setStatus] = useState<Status>(DEFAULT_STATUS);
  const [showControls, setShowControls] = useState(true);

  const onPlaybackStatusUpdate = async (newStatus: Status) => {
    // console.log('newStatus', newStatus)
    if (!newStatus) {
      return;
    }

    if (newStatus?.error) {
      console.log('VIDEO ERROR!', newStatus?.error);
      return;
    }

    if (!playerRef) {
      return;
    }
    // if(newStatus?.isBuffering){
    //     console.log('Buffering')
    // }
    if (newStatus?.isLoaded) {
      // if (newStatus?.didJustFinish) {
      //   await player.stopAsync().catch((err) => {});
      //   await player.setStatusAsync(defaultStatus).catch((err) => {});
      //   status.current = defaultStatus;
      //   setStatus(status.current);
      //   setVideoSource({ uri: null });
      //   // autoplay another video ...

      //   playNextItem();
      // }

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

  const toggleControls = () => setShowControls(!showControls);

  const togglePlayPause = () => {
    const { isPlaying } = status;

    if (isPlaying) {
      playerRef.current?.pauseAsync();
    } else {
      playerRef.current?.playAsync();
    }
  };

  const containerProps = () => {
    return {
      playerRef,
      status,
      showControls,
    };
  };

  const containerFunctions = {
    onPlaybackStatusUpdate,
    toggleControls,
    togglePlayPause,
  };

  // TODO useKeepAwake();
  return AppStore.isTV ? (
    <PlayerComponentTV
      {...containerProps()}
      {...containerFunctions}
    />
  ) : (
    <PlayerComponent
      {...containerProps()}
      {...containerFunctions}
    />
  );
}

export default PlayerContainer;
