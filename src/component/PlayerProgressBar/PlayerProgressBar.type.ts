import { RewindDirection } from 'Component/Player/Player.config';
import { VideoPlayer } from 'react-native-video';

export interface PlayerProgressBarContainerProps {
  player: VideoPlayer;
  storyboardUrl?: string;
  seekToPosition: (percent: number) => void;
  calculateCurrentTime: (percent: number) => number;

  // TV Only
  handleIsScrolling?: (value: boolean) => void;

  // Mobile Only
  thumbFocusKey?: string;
  hideActions?: boolean;
  onFocus?: () => void
  // toggleSeekMode?: () => void;
  rewindPosition?: (direction: RewindDirection, seconds: number) => void;
  togglePlayPause?: (state?: boolean, stopEvents?: boolean) => void;
  handleUserInteraction?: () => void;
}

export interface PlayerProgressBarComponentProps extends PlayerProgressBarContainerProps {
}
