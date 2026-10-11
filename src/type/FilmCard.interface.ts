import { FilmType } from './FilmType.type';
import { FilmRatingsInterface } from './FilmRatings.interface';
import { ContentSource } from '../source/types/ContentSource';

export interface FilmCardInterface {
  id: string;
  link: string;
  type: FilmType;
  poster: string;
  title: string;
  subtitle: string;
  info?: string;
  isEpisodic?: boolean;
  contentTypePending?: boolean;
  originalTitle?: string;
  externalIds?: { imdb?: string; tmdb?: string; kinopoisk?: string };
  ratings?: FilmRatingsInterface;
  ratingSourceType?: ContentSource;
  ratingFilmId?: string;
  isPendingRelease?: boolean;
}


