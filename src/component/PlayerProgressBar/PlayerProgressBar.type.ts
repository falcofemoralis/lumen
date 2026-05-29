import { RewindDirection } from 'Component/Player/Player.config';
import { VideoPlayer } from 'expo-video';
import { RefObject } from 'react';
import { SpatialNavigationNodeRef } from 'react-tv-space-navigation';

export interface PlayerProgressBarContainerProps {
  player: VideoPlayer;
  storyboardUrl?: string;
  seekToPosition: (percent: number) => void;
  calculateCurrentTime: (percent: number) => number;

  // TV Only
  handleIsScrolling?: (value: boolean) => void;

  // Mobile Only
  thumbRef?: RefObject<SpatialNavigationNodeRef | null>;
  hideActions?: boolean;
  onFocus?: () => void
  // toggleSeekMode?: () => void;
  rewindPosition?: (direction: RewindDirection, seconds: number) => void;
  togglePlayPause?: (state?: boolean, stopEvents?: boolean) => void;
  handleUserInteraction?: () => void;
}

export interface PlayerProgressBarComponentProps extends PlayerProgressBarContainerProps {
}
