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

export type PlayerComponentProps = {
  onPlaybackStatusUpdate: (newStatus: Status) => void;
  playerRef: React.RefObject<Video>;
  status: Status;
  showControls: boolean;
  toggleControls: () => void;
  togglePlayPause: () => void;
  rewindPosition: (type: RewindDirection, ms?: number) => void;
  seekToPosition: (percent: number) => void;
};
