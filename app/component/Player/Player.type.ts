import { RewindDirection } from './Player.config';
import { VideoPlayer } from 'expo-video';

export interface PlayerContainerProps {
  uri: string;
}

export interface PlayerComponentProps {
  player: VideoPlayer;
  status: Status;
  showControls: boolean;
  toggleControls: () => void;
  togglePlayPause: () => void;
  rewindPosition: (type: RewindDirection, ms?: number) => void;
  seekToPosition: (percent: number) => void;
}

export type Status = {
  progressPercentage: number;
  playablePercentage: number;
  isPlaying: boolean;
};
