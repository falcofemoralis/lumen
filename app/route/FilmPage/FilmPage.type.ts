import FilmInterface from 'Type/Film.interface';
import { FilmVideoInterface } from 'Type/FilmVideo.interface';

export interface FilmPageContainerProps {
  link: string;
}

export interface FilmPageComponentProps {
  film: FilmInterface | null;
  filmVideo: FilmVideoInterface | null;
  isSelectorVisible: boolean;
  playFilm: () => void;
  hideVideoSelector: () => void;
  handleVideoSelect: (video: FilmVideoInterface) => void;
}
