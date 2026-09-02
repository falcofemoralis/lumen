import { PlayerVideoSelectorRef } from 'Component/PlayerVideoSelector/PlayerVideoSelector.container';
import { DropdownItem } from 'Component/ThemedDropdown/ThemedDropdown.type';
import { ThemedOverlayRef } from 'Component/ThemedOverlay/ThemedOverlay.type';
import { RefObject } from 'react';
import { SharedValue } from 'react-native-reanimated';
import { ResizeMode, VideoPlayer, VideoPlayerStatus } from 'react-native-video';
import { FilmInterface } from 'Type/Film.interface';
import { FilmVideoInterface, SubtitleInterface } from 'Type/FilmVideo.interface';
import { FilmVoiceInterface } from 'Type/FilmVoice.interface';

import { RewindDirection } from './Player.config';

// react-native-video has no video track selection API - the track we display is
// derived from what the player actually renders (`onLoad` / `onBandwidthUpdate`).
export interface PlayerVideoTrack {
  quality: string;
  width?: number;
  height?: number;
}

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
  videoTrack: PlayerVideoTrack | null;
  selectedQuality: string;
  selectedSubtitle?: SubtitleInterface;
  qualityOverlayRef: RefObject<ThemedOverlayRef | null>;
  subtitleOverlayRef: RefObject<ThemedOverlayRef | null>;
  playerVideoSelectorOverlayRef: RefObject<PlayerVideoSelectorRef | null>;
  commentsOverlayRef: RefObject<ThemedOverlayRef | null>;
  bookmarksOverlayRef: RefObject<ThemedOverlayRef | null>;
  speedOverlayRef: RefObject<ThemedOverlayRef | null>;
  cdnOverlayRef: RefObject<ThemedOverlayRef | null>;
  selectedCDN: string;
  isAutomaticCDN: boolean;
  cdnOptions: string[];
  selectedSpeed: number;
  selectedAspectRatio: ResizeMode;
  isLocked: boolean;
  isOverlayOpen: boolean;
  isFilmBookmarked: boolean;
  isOffline?: boolean;
  overlayQuality: string;
  isVideoLoading: boolean;
  hasPlaybackError: boolean;
  // TV only - a phone panel has a fixed refresh rate there is no point matching to
  isAutoFrameRateSupported: boolean;
  isAutoFrameRateEnabled: boolean;
  toggleAutoFrameRate: () => void;
  // false on a device with no audio effects, and while the setting is off
  isVolumeNormalizationSupported: boolean;
  isVolumeNormalizationEnabled: boolean;
  toggleVolumeNormalization: () => void;
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
  openCDNSelector: () => void;
  handleCDNChange: (value: string) => void;
  handleAutomaticCDNChange: (value: boolean) => void;
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

/**
 * Everything a slide indicator draws itself from, all of it on the UI thread: the level
 * the bar fills to, the fade that shows and hides it, and the percent of the player
 * width it sits at - the side away from the finger, which is not fixed once a single
 * gesture is allowed to own the whole width.
 */
export interface PlayerSlideIndicatorState {
  value: SharedValue<number>;
  opacity: SharedValue<number>;
  offset: SharedValue<number>;
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
  lastVoiceId: string | null;
}

export interface FirestoreDocument {
  savedTime: string;
  updatedAt: string;
}
