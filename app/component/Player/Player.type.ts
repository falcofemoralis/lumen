import { AVPlaybackStatus, Video } from 'expo-av';
import { RewindDirection } from './Player.config';

export type Status = Partial<AVPlaybackStatus> & {
  isPlaying?: boolean;
  isLoaded?: boolean;
  isBuffering?: boolean;
  didJustFinish?: boolean;
  uri?: string;
  rate?: number;
  positionMillis?: number;
  playableDurationMillis?: number;
  durationMillis?: number;
  error?: string;
  // custom
  progressPercentage?: number;
  playablePercentage?: number;
};

export type PlayerContainerProps = {
  uri: string;
};

export type PlayerComponentProps = {
  uri: string;
  playerRef: React.RefObject<Video>;
  status: Status;
  isPlaying: boolean;
  showControls: boolean;
  onPlaybackStatusUpdate: (newStatus: Status) => void;
  toggleControls: () => void;
  togglePlayPause: () => void;
  seekToPosition: (percent: number) => void;
  rewindPosition: (type: RewindDirection, ms?: number) => void;
  rewindPositionAuto: (type: RewindDirection, ms?: number) => void;
};
