import { useCallback, useState } from 'react';
import {
  onPlaybackStateChangeData,
  useEvent,
  VideoPlayer,
  VideoPlayerStatus,
} from 'react-native-video';

/**
 * react-native-video's `useEvent` only subscribes, it does not keep the value in
 * state the way expo-video's `useEvent` did. This mirrors the two player flags
 * the UI renders from, and re-seeds them whenever the player itself is replaced
 * (a new source creates a new player instance).
 */
export const useVideoPlayerState = (player: VideoPlayer) => {
  const [trackedPlayer, setTrackedPlayer] = useState<VideoPlayer>(player);
  const [status, setStatus] = useState<VideoPlayerStatus>(() => player.status);
  const [isPlaying, setIsPlaying] = useState<boolean>(() => player.isPlaying);

  // a new source builds a new player instance - re-seed from it during render
  // rather than in an effect, so no frame renders the previous player's flags
  if (trackedPlayer !== player) {
    setTrackedPlayer(player);
    setStatus(player.status);
    setIsPlaying(player.isPlaying);
  }

  const onPlaybackStateChange = useCallback(
    ({ isPlaying: playing }: onPlaybackStateChangeData) => setIsPlaying(playing),
    []
  );

  useEvent(player, 'onStatusChange', setStatus);
  useEvent(player, 'onPlaybackStateChange', onPlaybackStateChange);

  return { status, isPlaying };
};

export default useVideoPlayerState;
