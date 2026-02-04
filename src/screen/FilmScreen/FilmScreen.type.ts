import { ParamListBase, RouteProp } from '@react-navigation/native';
import { FilmInterface } from 'Type/Film.interface';
import { FilmVideoInterface } from 'Type/FilmVideo.interface';
import { FilmVoiceInterface } from 'Type/FilmVoice.interface';
import { ScheduleItemInterface } from 'Type/ScheduleItem.interface';
import { ThemedOverlayRef } from 'Component/ThemedOverlay/ThemedOverlay.type';

export interface FilmScreenContainerProps {
  route: RouteProp<ParamListBase, string>;
}

export interface FilmScreenComponentProps {
  film: FilmInterface | null;
  thumbnailPoster: string;
  visibleScheduleItems: ScheduleItemInterface[];
  playerVideoSelectorOverlayRef: React.RefObject<ThemedOverlayRef | null>;
  scheduleOverlayRef: React.RefObject<ThemedOverlayRef | null>;
  commentsOverlayRef: React.RefObject<ThemedOverlayRef | null>;
  bookmarksOverlayRef: React.RefObject<ThemedOverlayRef | null>;
  descriptionOverlayRef: React.RefObject<ThemedOverlayRef | null>;
  playFilm: () => void;
  handleVideoSelect: (video: FilmVideoInterface, voice: FilmVoiceInterface) => void;
  handleSelectFilm: (film: FilmInterface) => void;
  handleSelectActor: (actorLink: string) => void;
  handleSelectCategory: (categoryLink: string) => void;
  handleUpdateScheduleWatch: (scheduleItem: ScheduleItemInterface) => Promise<boolean>;
  handleShare: () => void;
  openBookmarks: () => void;
  handleBookmarkChange: (film: FilmInterface) => void;
}
