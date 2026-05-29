import { ParamListBase, RouteProp } from '@react-navigation/native';
import { PlayerVideoSelectorRef } from 'Component/PlayerVideoSelector/PlayerVideoSelector.container';
import { ThemedOverlayRef } from 'Component/ThemedOverlay/ThemedOverlay.type';
import { RefObject } from 'react';
import { DownloadLinkInterface } from 'Type/DownloadLink.interface';
import { FilmInterface } from 'Type/Film.interface';
import { FilmVideoInterface } from 'Type/FilmVideo.interface';
import { FilmVoiceInterface } from 'Type/FilmVoice.interface';
import { ScheduleItemInterface } from 'Type/ScheduleItem.interface';

export interface FilmScreenContainerProps {
  route: RouteProp<ParamListBase, string>;
}

export interface FilmScreenComponentProps {
  film: FilmInterface | null;
  thumbnailPoster?: string;
  visibleScheduleItems: ScheduleItemInterface[];
  playerVideoSelectorOverlayRef: RefObject<PlayerVideoSelectorRef | null>;
  scheduleOverlayRef: RefObject<ThemedOverlayRef | null>;
  commentsOverlayRef: RefObject<ThemedOverlayRef | null>;
  bookmarksOverlayRef: RefObject<ThemedOverlayRef | null>;
  descriptionOverlayRef: RefObject<ThemedOverlayRef | null>;
  playerVideoDownloaderOverlayRef: RefObject<PlayerVideoSelectorRef | null>;
  isDeepLink: boolean;
  ratingOverlayRef: RefObject<ThemedOverlayRef | null>;
  shouldDisplayContinueWatching: boolean;
  isContinueWatchingLoading: boolean;
  playFilm: () => void;
  handleVideoSelect: (video: FilmVideoInterface, voice: FilmVoiceInterface) => void;
  handleSelectFilm: (film: FilmInterface) => void;
  handleSelectActor: (actorLink: string) => void;
  handleSelectCategory: (categoryLink: string) => void;
  handleUpdateScheduleWatch: (scheduleItem: ScheduleItemInterface) => Promise<boolean>;
  handleShare: () => void;
  openBookmarks: () => void;
  handleBookmarkChange: (film: FilmInterface) => void;
  openVideoDownloader: () => void;
  handleDownloadSelect: (links: DownloadLinkInterface[]) => void;
  openTrailerOverlay: () => void;
  handleRatingSelect: (rating: number) => Promise<void>;
  openRatingOverlay: () => void;
  continueWatching: () => void;
}
