import { DropdownItem } from 'Component/ThemedDropdown/ThemedDropdown.type';
import { ThemedOverlayRef } from 'Component/ThemedOverlay/ThemedOverlay.type';
import { VideoPlayer } from 'expo-video';
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
  qualityOverlayRef: React.RefObject<ThemedOverlayRef | null>;
  subtitleOverlayRef: React.RefObject<ThemedOverlayRef | null>;
  playerVideoSelectorOverlayRef: React.RefObject<ThemedOverlayRef | null>;
  commentsOverlayRef: React.RefObject<ThemedOverlayRef | null>;
  bookmarksOverlayRef: React.RefObject<ThemedOverlayRef | null>;
  speedOverlayRef: React.RefObject<ThemedOverlayRef | null>;
  selectedSpeed: number;
  isLocked: boolean;
  isOverlayOpen: boolean;
  isFilmBookmarked: boolean;
  togglePlayPause: (state?: boolean, stopEvents?: boolean) => void;
  rewindPosition: (type: RewindDirection, seconds?: number) => void;
  seekToPosition: (percent: number) => void;
  calculateCurrentTime: (percent: number) => number;
  openQualitySelector: () => void;
  handleQualityChange: (item: DropdownItem) => void;
  handleNewEpisode: (type: RewindDirection) => void;
  openVideoSelector: () => void;
  handleVideoSelect: (video: FilmVideoInterface, voice: FilmVoiceInterface) => void;
  setPlayerRate: (rate: number) => void;
  openSubtitleSelector: () => void;
  handleSubtitleChange: (item: DropdownItem) => void;
  handleSpeedChange: (item: DropdownItem) => void;
  openSpeedSelector: () => void;
  openCommentsOverlay: () => void;
  openBookmarksOverlay: () => void;
  handleLockControls: () => void;
  handleShare: () => void;
  closeOverlay: () => void;
  onBookmarkChange: (film: FilmInterface) => void;
  backwardToStart: () => void;
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

export interface DoubleTapAction {
  seconds: number;
  direction: RewindDirection;
}

export interface SavedTimestamp {
  time: number;
  progress: number;
  deviceId?: string;
}

export interface SavedTimeVoice {
  timestamps: Record<string, SavedTimestamp | null>; // seasonId+episodeId - time
}

export interface SavedTime {
  filmId: string;
  voices: Record<string, SavedTimeVoice | null>; // voiceId - data
}

export interface FirestoreDocument {
  savedTime: string;
  updatedAt: string;
}
