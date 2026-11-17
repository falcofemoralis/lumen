import { FilmInterface } from 'Type/Film.interface';

export interface FilmTrailerScreenContainerProps {
  film: FilmInterface;
}

export interface FilmTrailerScreenComponentProps {
  trailerUrl: string | null;
  sourceLabel?: string;
  isLoading: boolean;
  backHandler: () => void;
}