import { ParamListBase, RouteProp } from '@react-navigation/native';
import { PlayerVideoSelectorRef } from 'Component/PlayerVideoSelector/PlayerVideoSelector.container';
import { ThemedOverlayRef } from 'Component/ThemedOverlay/ThemedOverlay.type';
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
  playerVideoSelectorOverlayRef: React.RefObject<PlayerVideoSelectorRef | null>;
  scheduleOverlayRef: React.RefObject<ThemedOverlayRef | null>;
  commentsOverlayRef: React.RefObject<ThemedOverlayRef | null>;
  bookmarksOverlayRef: React.RefObject<ThemedOverlayRef | null>;
  descriptionOverlayRef: React.RefObject<ThemedOverlayRef | null>;
  playerVideoDownloaderOverlayRef: React.RefObject<PlayerVideoSelectorRef | null>;
  isDeepLink: boolean;
  ratingOverlayRef: React.RefObject<ThemedOverlayRef | null>;
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
}
