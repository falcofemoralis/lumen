import { VideoPlayer } from 'expo-video';
import { FilmInterface } from 'Type/Film.interface';
import { FilmVideoInterface } from 'Type/FilmVideo.interface';

import { RewindDirection } from './Player.config';

export interface PlayerContainerProps {
  video: FilmVideoInterface;
  film: FilmInterface
}

export interface PlayerComponentProps {
  player: VideoPlayer;
  status: Status;
  film: FilmInterface;
  togglePlayPause: () => void;
  rewindPosition: (type: RewindDirection, ms?: number) => void;
  rewindPositionAuto: (type: RewindDirection, ms?: number) => void;
  seekToPosition: (percent: number) => void;
  calculateCurrentTime: (percent: number) => number;
}

export type Status = {
  progressPercentage: number;
  playablePercentage: number;
  isPlaying: boolean;
  currentTime: string;
  durationTime: string;
  remainingTime: string;
};

export interface LongEvent {
  isKeyDownPressed: boolean;
  longTimeout: NodeJS.Timeout | null;
  isLongFired: boolean;
}
