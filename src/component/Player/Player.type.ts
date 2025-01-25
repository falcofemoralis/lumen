import { DropdownItem } from 'Component/ThemedDropdown/ThemedDropdown.type';
import { VideoPlayer } from 'expo-video';
import { FilmInterface } from 'Type/Film.interface';
import { FilmStreamInterface } from 'Type/FilmStream.interface';
import { FilmVideoInterface } from 'Type/FilmVideo.interface';
import { FilmVoiceInterface } from 'Type/FilmVoice.interface';

import { RewindDirection } from './Player.config';

export interface PlayerContainerProps {
  video: FilmVideoInterface;
  stream: FilmStreamInterface;
  film: FilmInterface
  voice: FilmVoiceInterface;
}

export interface PlayerComponentProps {
  player: VideoPlayer;
  isLoading: boolean;
  isPlaying: boolean;
  progressStatus: ProgressStatus;
  video: FilmVideoInterface;
  film: FilmInterface;
  voice: FilmVoiceInterface;
  selectedQuality: string;
  togglePlayPause: () => void;
  rewindPosition: (type: RewindDirection, seconds?: number) => void;
  rewindPositionAuto: (type: RewindDirection, seconds?: number) => void;
  seekToPosition: (percent: number) => void;
  calculateCurrentTime: (percent: number) => number;
  openQualitySelector: () => void;
  handleQualityChange: (item: DropdownItem) => void;
  handleNewEpisode: (type: RewindDirection) => void;
  openVideoSelector: () => void;
  hideVideoSelector: () => void;
  handleVideoSelect: (video: FilmVideoInterface, voice: FilmVoiceInterface) => void;
  setPlayerRate: (rate: number) => void;
}

export type ProgressStatus = {
  progressPercentage: number;
  playablePercentage: number;
  currentTime: string;
  durationTime: string;
  remainingTime: string;
};

export interface LongEvent {
  isKeyDownPressed: boolean;
  longTimeout: NodeJS.Timeout | null;
  isLongFired: boolean;
}
