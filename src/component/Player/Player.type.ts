import { DropdownItem } from 'Component/ThemedDropdown/ThemedDropdown.type';
import { VideoPlayer, VideoView } from 'expo-video';
import { FilmInterface } from 'Type/Film.interface';
import { FilmStreamInterface } from 'Type/FilmStream.interface';
import { FilmVideoInterface, SubtitleInterface } from 'Type/FilmVideo.interface';
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
  video: FilmVideoInterface;
  film: FilmInterface;
  voice: FilmVoiceInterface;
  selectedQuality: string;
  selectedSubtitle?: SubtitleInterface;
  qualityOverlayId: string;
  subtitleOverlayId: string;
  playerVideoSelectorOverlayId: string;
  commentsOverlayId: string;
  bookmarksOverlayId: string;
  togglePlayPause: (state?: boolean) => void;
  rewindPosition: (type: RewindDirection, seconds?: number) => void;
  seekToPosition: (percent: number) => void;
  calculateCurrentTime: (percent: number) => number;
  openQualitySelector: () => void;
  handleQualityChange: (item: DropdownItem) => void;
  handleNewEpisode: (type: RewindDirection) => void;
  openVideoSelector: () => void;
  hideVideoSelector: () => void;
  handleVideoSelect: (video: FilmVideoInterface, voice: FilmVoiceInterface) => void;
  setPlayerRate: (rate: number) => void;
  openSubtitleSelector: () => void;
  handleSubtitleChange: (item: DropdownItem) => void;
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
