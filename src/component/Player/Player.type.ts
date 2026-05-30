import { PlayerVideoSelectorRef } from 'Component/PlayerVideoSelector/PlayerVideoSelector.container';
import { DropdownItem } from 'Component/ThemedDropdown/ThemedDropdown.type';
import { ThemedOverlayRef } from 'Component/ThemedOverlay/ThemedOverlay.type';
import { VideoContentFit, VideoPlayer, VideoPlayerStatus, VideoTrack } from 'expo-video';
import { RefObject } from 'react';
import { FilmInterface } from 'Type/Film.interface';
import { FilmVideoInterface, SubtitleInterface } from 'Type/FilmVideo.interface';
import { FilmVoiceInterface } from 'Type/FilmVoice.interface';

import { RewindDirection } from './Player.config';

export interface PlayerContainerProps {
  video: FilmVideoInterface;
  film: FilmInterface
  voice: FilmVoiceInterface;
  isOffline?: boolean;
  quality?: string;
}

export interface PlayerComponentProps {
  player: VideoPlayer;
  status: VideoPlayerStatus;
  isPlaying: boolean;
  video: FilmVideoInterface;
  film: FilmInterface;
  voice: FilmVoiceInterface;
  videoTrack: VideoTrack | null;
  selectedQuality: string;
  selectedSubtitle?: SubtitleInterface;
  qualityOverlayRef: RefObject<ThemedOverlayRef | null>;
  subtitleOverlayRef: RefObject<ThemedOverlayRef | null>;
  playerVideoSelectorOverlayRef: RefObject<PlayerVideoSelectorRef | null>;
  commentsOverlayRef: RefObject<ThemedOverlayRef | null>;
  bookmarksOverlayRef: RefObject<ThemedOverlayRef | null>;
  speedOverlayRef: RefObject<ThemedOverlayRef | null>;
  selectedSpeed: number;
  selectedAspectRatio: VideoContentFit;
  isLocked: boolean;
  isOverlayOpen: boolean;
  isFilmBookmarked: boolean;
  isOffline?: boolean;
  overlayQuality: string;
  isLoading: boolean;
  togglePlayPause: (state?: boolean, stopEvents?: boolean) => void;
  rewindPosition: (type: RewindDirection, seconds: number) => void;
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
  handleAspectRatioChange: () => void;
  openCommentsOverlay: () => void;
  openBookmarksOverlay: () => void;
  handleLockControls: () => void;
  handleShare: () => void;
  closeOverlay: () => void;
  onBookmarkChange: (film: FilmInterface) => void;
  backwardToStart: () => void;
  handleBackButtonPress: () => void;
}

export type ProgressStatus = {
  progressPercentage: number;
  playablePercentage: number;
  currentTime: string;
  durationTime: string;
  remainingTime: string;
  bufferedTime: string;
  endDate?: number;
};

export interface LongEvent {
  isKeyDownPressed: boolean;
  longTimeout: number | null;
  isLongFired: boolean;
}

export interface DoubleTapAction {
  seconds: number;
  direction: RewindDirection;
  isVisible: boolean;
}

export interface SavedTimestamp {
  time: number;
  progress: number;
  deviceId?: string;
}

export interface SavedTimeVoice {
  timestamps: Record<string, SavedTimestamp | null>; // seasonId+episodeId - time
  lastSeasonId?: string;
  lastEpisodeId?: string;
}

export interface SavedTime {
  filmId: string;
  voices: Record<string, SavedTimeVoice | null>; // voiceId - data
}

export interface FirestoreDocument {
  savedTime: string;
  updatedAt: string;
}
