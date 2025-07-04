import { FilmInterface } from 'Type/Film.interface';
import { FilmVideoInterface } from 'Type/FilmVideo.interface';
import { FilmVoiceInterface } from 'Type/FilmVoice.interface';
import { ScheduleItemInterface } from 'Type/ScheduleItem.interface';

export interface FilmPageContainerProps {
  link: string;
  thumbnailPoster: string;
}

export interface FilmPageComponentProps {
  film: FilmInterface | null;
  thumbnailPoster: string;
  visibleScheduleItems: ScheduleItemInterface[];
  playerVideoSelectorOverlayId: string;
  scheduleOverlayId: string;
  commentsOverlayId: string;
  bookmarksOverlayId: string;
  descriptionOverlayId: string;
  playFilm: () => void;
  hideVideoSelector: () => void;
  handleVideoSelect: (video: FilmVideoInterface, voice: FilmVoiceInterface) => void;
  handleSelectFilm: (film: FilmInterface) => void;
  handleSelectActor: (actorLink: string) => void;
  handleSelectCategory: (categoryLink: string) => void;
  handleUpdateScheduleWatch: (scheduleItem: ScheduleItemInterface) => Promise<boolean>;
  handleShare: () => void;
  openBookmarks: () => void;
}
