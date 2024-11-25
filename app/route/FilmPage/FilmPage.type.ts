import Film from 'Type/Film.interface';
import { FilmVideo } from 'Type/FilmVideo.interface';

export interface FilmPageContainerProps {
  link: string;
}

export interface FilmPageComponentProps {
  film: Film | null;
  filmVideo: FilmVideo | null;
  isSelectorVisible: boolean;
  playFilm: () => void;
  hideVideoSelector: () => void;
  handleVideoSelect: (video: FilmVideo) => void;
}
