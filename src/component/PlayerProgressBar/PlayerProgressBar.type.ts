import { RewindDirection } from 'Component/Player/Player.config';
import { VideoPlayer } from 'react-native-video';

export interface PlayerProgressBarContainerProps {
  player: VideoPlayer;
  storyboardUrl?: string;
  seekToPosition: (percent: number) => void;
  calculateCurrentTime: (percent: number) => number;

  // both platforms - a pointer drag holds the controls open on either
  handleIsScrolling?: (value: boolean) => void;
  handleUserInteraction?: () => void;

  // TV Only
  thumbFocusKey?: string;
  hideActions?: boolean;
  onFocus?: () => void
  rewindPosition?: (direction: RewindDirection, seconds: number) => void;
  togglePlayPause?: (state?: boolean, stopEvents?: boolean) => void;
}

export interface PlayerProgressBarComponentProps extends PlayerProgressBarContainerProps {
}
