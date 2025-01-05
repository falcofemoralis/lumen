import { DropdownItem } from 'Component/ThemedDropdown/ThemedDropdown.type';
import { VideoPlayer } from 'expo-video';
import { FilmInterface } from 'Type/Film.interface';
import { FilmVideoInterface } from 'Type/FilmVideo.interface';
import { FilmVoiceInterface } from 'Type/FilmVoice.interface';

import { RewindDirection } from './Player.config';

export interface PlayerContainerProps {
  video: FilmVideoInterface;
  film: FilmInterface
  voice: FilmVoiceInterface;
}

export interface PlayerComponentProps {
  player: VideoPlayer;
  status: Status;
  video: FilmVideoInterface;
  film: FilmInterface;
  voice: FilmVoiceInterface;
  selectedQuality: string;
  togglePlayPause: () => void;
  rewindPosition: (type: RewindDirection, ms?: number) => void;
  rewindPositionAuto: (type: RewindDirection, ms?: number) => void;
  seekToPosition: (percent: number) => void;
  calculateCurrentTime: (percent: number) => number;
  openQualitySelector: () => void;
  handleQualityChange: (item: DropdownItem) => void;
}

export type Status = {
  progressPercentage: number;
  playablePercentage: number;
  isPlaying: boolean;
  isLoading: boolean;
  currentTime: string;
  durationTime: string;
  remainingTime: string;
};

export interface LongEvent {
  isKeyDownPressed: boolean;
  longTimeout: NodeJS.Timeout | null;
  isLongFired: boolean;
}
