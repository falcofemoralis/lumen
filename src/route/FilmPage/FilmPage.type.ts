import { FilmInterface } from 'Type/Film.interface';
import { FilmVideoInterface } from 'Type/FilmVideo.interface';
import { FilmVoiceInterface } from 'Type/FilmVoice.interface';
import { ScheduleItemInterface } from 'Type/ScheduleItem.interface';

export interface FilmPageContainerProps {
  link: string;
}

export interface FilmPageComponentProps {
  film: FilmInterface | null;
  visibleScheduleItems: ScheduleItemInterface[];
  playFilm: () => void;
  hideVideoSelector: () => void;
  handleVideoSelect: (video: FilmVideoInterface, voice: FilmVoiceInterface) => void;
  handleSelectFilm: (filmLink: string) => void;
}
