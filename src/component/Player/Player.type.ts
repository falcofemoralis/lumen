import { VideoPlayer } from 'expo-video';

import { RewindDirection } from './Player.config';

export interface PlayerContainerProps {
  uri: string;
}

export interface PlayerComponentProps {
  player: VideoPlayer;
  status: Status;
  togglePlayPause: () => void;
  rewindPosition: (type: RewindDirection, ms?: number) => void;
  rewindPositionAuto: (type: RewindDirection, ms?: number) => void;
  seekToPosition: (percent: number) => void;
}

export type Status = {
  progressPercentage: number;
  playablePercentage: number;
  isPlaying: boolean;
};
