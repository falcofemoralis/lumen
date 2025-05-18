import { RewindDirection } from 'Component/Player/Player.config';
import { ProgressStatus } from 'Component/Player/Player.type';
import { VideoPlayer } from 'expo-video';
import { SpatialNavigationNodeRef } from 'react-tv-space-navigation';

export interface PlayerProgressBarContainerProps {
  player: VideoPlayer;
  storyboardUrl?: string;
  seekToPosition: (percent: number) => void;
  calculateCurrentTime: (percent: number) => number;
  handleUserInteraction: () => void;

  // TV Only
  handleIsScrolling?: (value: boolean) => void;

  // Mobile Only
  thumbRef?: React.MutableRefObject<SpatialNavigationNodeRef | null>;
  hideActions?: boolean;
  onFocus?: () => void
  toggleSeekMode?: () => void;
  rewindPosition?: (direction: RewindDirection, seconds?: number) => void;
  togglePlayPause?: (state?: boolean) => void;
}

export interface PlayerProgressBarComponentProps extends PlayerProgressBarContainerProps {
}
